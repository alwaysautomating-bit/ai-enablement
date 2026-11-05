import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Db } from "../lib/db";
import { audit } from "../lib/context/audit";
import { CaptureInputError, startCapture } from "../lib/context/capture-service";
import type { ExtractionModel } from "../lib/context/extraction/model";
import { getCaptureView, getEntityTimeline, getEvidence, listCaptures, searchContext } from "../lib/context/projection";
import { listSourceOptions } from "../lib/context/sample-data";
import type { Principal } from "../lib/context/types";

// MCP interface for Codex, Claude Code, and other AI clients. The AI Enablement app stays
// the system of record: every tool authorizes through the same projection service as the
// web UI, and every call is audited. There are deliberately no tools to confirm or correct
// context, widen visibility, or write to any external system.

export type ContextServerOptions = {
  db: Db;
  principal: Principal;
  scopes: string[];
  model: () => ExtractionModel;
};

const PROVENANCE_NOTE =
  "Every confirmed item was reviewed by a person and carries provenance: the source messages, who wrote them, " +
  "when they were communicated, and when the fact was true in the operation (these can differ). " +
  "Items marked UNREVIEWED_CANDIDATE have not been confirmed and must not be presented as fact.";

function result(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

function refusal(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

export function createContextMcpServer(options: ContextServerOptions) {
  const { db, principal, scopes } = options;
  const server = new McpServer(
    { name: "ai-enablement-context", version: "0.1.0" },
    {
      instructions:
        "Operational context reviewed by people in the AI Enablement Workspace. " +
        PROVENANCE_NOTE +
        " Cite provenance when answering. Say plainly when the context does not cover a question. " +
        "Review happens in the workspace, not here.",
    },
  );

  const canRead = scopes.includes("context:read");
  const logCall = (tool: string, metadata: Record<string, string | number | boolean | null> = {}) =>
    audit(db, principal, "MCP_TOOL_CALLED", "MCP_TOOL", tool, metadata);

  // PORK tool contracts are exposed under their canonical names as aliases of the original
  // workspace tools, so existing Claude and Codex configurations keep working.
  const registerWithAlias = (
    name: string,
    alias: string,
    porkTool: string,
    config: { title?: string; description?: string } & Record<string, unknown>,
    handler: (args: never) => Promise<unknown>,
  ) => {
    const register = server.registerTool.bind(server) as unknown as (n: string, c: unknown, cb: unknown) => void;
    register(name, config, handler);
    register(
      alias,
      {
        ...config,
        title: `${config.title ?? name} (PORK ${porkTool})`,
        description: `PORK contract ${porkTool}; alias of ${name}. ${config.description ?? ""}`,
      },
      handler,
    );
  };

  registerWithAlias(
    "search_context",
    "operational_memory_search",
    "tool.operational-memory-search",
    {
      title: "Search confirmed operational context",
      description:
        "Search people-reviewed operational context (responsibilities, relationships, decisions, rules, exceptions, open questions) " +
        "with provenance. Set include_unreviewed to also see your own unreviewed candidates, clearly labelled.",
      inputSchema: {
        query: z.string().describe("Names, topics, or a question in plain words."),
        include_unreviewed: z.boolean().optional(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, include_unreviewed }: { query: string; include_unreviewed?: boolean }) => {
      if (!canRead) return refusal("This token cannot read context.");
      await logCall("search_context", { includeCandidates: Boolean(include_unreviewed) });
      return result({
        note: PROVENANCE_NOTE,
        ...(await searchContext(db, principal, query, { includeCandidates: include_unreviewed })),
      });
    },
  );

  registerWithAlias(
    "get_entity_timeline",
    "relationship_traversal",
    "tool.relationship-traversal",
    {
      title: "Entity timeline",
      description:
        "Confirmed relationships for one person, organization, account, project, or other entity over time, with when each was " +
        "true (operational time) and when it was first communicated.",
      inputSchema: { entity: z.string().describe("Entity name, alias, or id.") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ entity }: { entity: string }) => {
      if (!canRead) return refusal("This token cannot read context.");
      await logCall("get_entity_timeline");
      const timeline = await getEntityTimeline(db, principal, entity);
      return timeline ? result(timeline) : result({ found: false, message: "No accessible entity by that name." });
    },
  );

  registerWithAlias(
    "get_evidence",
    "evidence_retrieval",
    "tool.evidence-retrieval",
    {
      title: "Read one source message",
      description: "Full stored text and metadata of one piece of evidence cited in provenance, if you may see it.",
      inputSchema: { evidence_id: z.string() },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ evidence_id }: { evidence_id: string }) => {
      if (!canRead) return refusal("This token cannot read context.");
      await logCall("get_evidence");
      const evidence = await getEvidence(db, principal, evidence_id);
      return evidence ? result(evidence) : result({ found: false });
    },
  );

  server.registerTool(
    "list_captures",
    {
      title: "List my captures",
      description: "Your recent context captures and their review status.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      if (!canRead) return refusal("This token cannot read context.");
      await logCall("list_captures");
      return result(await listCaptures(db, principal));
    },
  );

  server.registerTool(
    "get_capture_summary",
    {
      title: "Capture summary",
      description:
        "What one of your captures found, grouped for review. Items with reviewState NEEDS_REVIEW are unreviewed candidates.",
      inputSchema: { capture_id: z.string() },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ capture_id }) => {
      if (!canRead) return refusal("This token cannot read context.");
      await logCall("get_capture_summary");
      const view = await getCaptureView(db, principal, capture_id);
      if (!view) return result({ found: false });
      return result({
        note: PROVENANCE_NOTE,
        id: view.id,
        question: view.question,
        status: view.status,
        stats: view.stats,
        summary: view.summary,
        items: view.assertions.map((assertion) => ({
          reviewState: assertion.reviewState === "NEEDS_REVIEW" ? "UNREVIEWED_CANDIDATE" : assertion.reviewState,
          kind: assertion.kind,
          statement: assertion.statement,
          modality: assertion.modality,
          confidence: assertion.confidence,
          operationalTime: assertion.operationalTime,
          communicated: assertion.communicated,
          provenance: assertion.evidence.map((evidence) => ({
            evidenceId: evidence.evidenceId,
            sourceMessageId: evidence.sourceMessageId,
            where: evidence.where,
            author: evidence.author,
            communicatedAt: evidence.communicatedAt,
            permalink: evidence.permalink,
            quote: evidence.quote,
            role: evidence.role,
          })),
        })),
      });
    },
  );

  server.registerTool(
    "list_sources",
    {
      title: "List connected sources",
      description: "Read-only sources you have connected and the places within each that a capture may look.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      if (!canRead) return refusal("This token cannot read context.");
      await logCall("list_sources");
      return result(await listSourceOptions(db, principal.userId));
    },
  );

  registerWithAlias(
    "start_capture",
    "bounded_context_capture",
    "tool.bounded-context-capture",
    {
      title: "Start a bounded context capture",
      description:
        "Read the chosen read-only sources for one question and propose candidate context. Results are NOT trusted until the " +
        "person reviews them in the AI Enablement Workspace. Choose places with list_sources; omit places to use every " +
        "available one.",
      inputSchema: {
        question: z.string().describe("One plain-language question, e.g. how a process actually works."),
        window_start: z.string().optional().describe("YYYY-MM-DD"),
        window_end: z.string().optional().describe("YYYY-MM-DD"),
        places: z
          .array(z.object({ grant_id: z.string(), scope_type: z.string(), value: z.string() }))
          .optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async ({
      question,
      window_start,
      window_end,
      places,
    }: {
      question: string;
      window_start?: string;
      window_end?: string;
      places?: Array<{ grant_id: string; scope_type: string; value: string }>;
    }) => {
      if (!scopes.includes("capture:start")) return refusal("This token cannot start captures.");
      const sources = await listSourceOptions(db, principal.userId);
      const available = sources.flatMap((source) =>
        source.options
          .filter((option) => !option.unavailableReason)
          .map((option) => ({ grantId: source.grantId, ...option })),
      );
      const chosen = places
        ? places.map((place) => {
            const match = available.find(
              (option) => option.grantId === place.grant_id && option.scopeType === place.scope_type && option.value === place.value,
            );
            if (!match) throw new CaptureInputError(`That place is not available: ${place.scope_type} ${place.value}`);
            return match;
          })
        : available.filter((option) => option.scopeType !== "EMAIL_LABEL");
      await logCall("start_capture", { places: chosen.length });
      try {
        const { captureId, stats } = await startCapture(
          db,
          principal,
          {
            question,
            windowStart: window_start ? new Date(`${window_start}T00:00:00Z`) : null,
            windowEnd: window_end ? new Date(`${window_end}T23:59:59Z`) : null,
            scopes: chosen.map((option) => ({
              grantId: option.grantId,
              scopeType: option.scopeType,
              value: option.value,
              label: option.label,
            })),
          },
          options.model(),
        );
        return result({
          captureId,
          status: "READY_FOR_REVIEW",
          proposed: stats.proposed,
          rejectedBeforeReview: stats.rejected.length,
          messagesRead: stats.messagesRead,
          nextStep: "Everything proposed is unreviewed. Review it in the AI Enablement Workspace under Understand how something works.",
        });
      } catch (error) {
        return refusal(error instanceof CaptureInputError ? error.message : "The capture could not be completed.");
      }
    },
  );

  return server;
}
