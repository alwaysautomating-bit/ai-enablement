import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { createContextMcpServer } from "../../mcp/context-server";
import { startCapture } from "./capture-service";
import { createScratchDatabase } from "./eval/test-db";
import { RecordedExtractionModel } from "./extraction/recorded";
import { RECORDED_EXTRACTION_PATH } from "./extraction/select";
import { assertGate, capabilityRecordFrom, CONTEXT_CAPTURE_REQUIRED_CLASSES, PermissionGateError, type GateInput } from "./permissions";
import { CONTEXT_CAPTURE_CAPABILITY, contextCaptureExtraction, loadCapability, loadLock } from "./pork";
import { principalForUser } from "./principal";
import { ensureSampleContextData } from "./sample-data";
import { StabilizationUnavailableError, type Stabilizer } from "./stabilizer";

const COMMIT = "a".repeat(40);
const HASH = "b".repeat(64);

function gateInput(overrides: Partial<GateInput> = {}): GateInput {
  return {
    capability: "context-capture",
    title: "Context Capture",
    version: { commit: COMMIT, contentSha256: HASH, committed: true },
    governance: {
      requested: [...CONTEXT_CAPTURE_REQUIRED_CLASSES],
      human_only: ["confirm_operational_facts", "broaden_visibility"],
    },
    classes: loadLock().permissionClasses.classes,
    approvals: [],
    ...overrides,
  };
}

function approval(granted: string[], extra: Partial<GateInput["approvals"][number]> = {}) {
  return {
    path: "x",
    id: `approval.${granted.join("-")}`,
    type: "capability-approval" as const,
    status: "active" as const,
    capability: "skill-pack.context-capture",
    version: { commit: COMMIT, content_sha256: HASH },
    scope: { sources: "live" as const },
    granted,
    denied: [],
    reviewer: { principal_type: "human", id: "laura", verification: "self_asserted_cli" },
    revokes: null,
    recorded_at: "2026-09-29T00:00:00Z",
    ...extra,
  };
}

describe("permission-class gate", () => {
  it("refuses live use with no approval, a partial approval, or another version", () => {
    expect(() => assertGate(gateInput(), CONTEXT_CAPTURE_REQUIRED_CLASSES)).toThrow(PermissionGateError);
    // Passing retrieval alone authorizes nothing else.
    const partial = gateInput({ approvals: [approval(["retrieve_authorized_evidence"])] });
    expect(() => assertGate(partial, CONTEXT_CAPTURE_REQUIRED_CLASSES)).toThrow(/Missing: reconstruct_conversations/);
    const otherVersion = gateInput({
      approvals: [approval([...CONTEXT_CAPTURE_REQUIRED_CLASSES], { version: { commit: COMMIT, content_sha256: "c".repeat(64) } })],
    });
    expect(() => assertGate(otherVersion, CONTEXT_CAPTURE_REQUIRED_CLASSES)).toThrow(PermissionGateError);
  });

  it("allows live use only for the exact committed version holding every class", () => {
    const full = gateInput({ approvals: [approval([...CONTEXT_CAPTURE_REQUIRED_CLASSES])] });
    expect(() => assertGate(full, CONTEXT_CAPTURE_REQUIRED_CLASSES)).not.toThrow();
    const uncommitted = { ...full, version: { ...full.version, committed: false } };
    expect(() => assertGate(uncommitted, CONTEXT_CAPTURE_REQUIRED_CLASSES)).toThrow(/uncommitted/);
    const fixtureOnly = gateInput({ approvals: [approval([...CONTEXT_CAPTURE_REQUIRED_CLASSES], { scope: { sources: "fixture_only" } })] });
    expect(() => assertGate(fixtureOnly, CONTEXT_CAPTURE_REQUIRED_CLASSES)).toThrow(PermissionGateError);
  });

  it("honours revocations and never grants human-only classes", () => {
    const granted = approval([...CONTEXT_CAPTURE_REQUIRED_CLASSES, "confirm_operational_facts"]);
    const revocation = { ...approval([]), id: "r1", type: "capability-approval-revocation" as const, status: "revoked" as const, revokes: granted.id };
    const record = capabilityRecordFrom(gateInput({ approvals: [granted] }));
    expect(record.classes.find((c) => c.id === "confirm_operational_facts")?.state).toBe("human_only");
    expect(record.classes.find((c) => c.id === "send_email")?.state).toBe("not_requested");
    expect(() => assertGate(gateInput({ approvals: [granted, revocation] }), CONTEXT_CAPTURE_REQUIRED_CLASSES)).toThrow(PermissionGateError);
  });
});

describe("shared capability path", () => {
  it("uses the pinned PORK skill, not a local prompt", () => {
    const extraction = contextCaptureExtraction();
    const pinned = loadCapability(CONTEXT_CAPTURE_CAPABILITY);
    expect(pinned.skills.some((skill) => skill.id === "extract-candidate-operational-context")).toBe(true);
    expect(extraction.instructions.length).toBeGreaterThan(100);
    expect(extraction.version).toMatch(/^pork:context-capture@[0-9a-f]{7}\+[0-9a-f]{12}/);
  });

  it("fails closed and stores nothing when SAME is unavailable", async () => {
    const { db } = createScratchDatabase();
    await ensureSampleContextData(db);
    const laura = (await principalForUser(db, "user_laura", "EVALUATION"))!;
    const grant = await db.sourceGrant.findFirstOrThrow({ where: { userId: laura.userId, provider: "FIXTURE_CHAT" } });
    const unavailable: Stabilizer = {
      id: "test:unavailable",
      stabilize: async () => {
        throw new StabilizationUnavailableError("down");
      },
    };
    await expect(
      startCapture(
        db,
        laura,
        {
          question: "Who approves vendor invoices now?",
          windowStart: null,
          windowEnd: null,
          scopes: [{ grantId: grant.id, scopeType: "CHAT_CHANNEL", value: "C-OPS", label: "#construction-ops" }],
        },
        new RecordedExtractionModel(RECORDED_EXTRACTION_PATH),
        unavailable,
      ),
    ).rejects.toBeInstanceOf(StabilizationUnavailableError);
    const capture = await db.capture.findFirstOrThrow();
    expect(capture.status).toBe("FAILED");
    expect(capture.failureReason).toMatch(/nothing was stored/);
    expect(await db.assertion.count()).toBe(0);
    expect(await db.evidence.count()).toBe(0);
    await db.$disconnect();
  });

  it("exposes PORK tool aliases that return exactly what the original tools return", async () => {
    const { db } = createScratchDatabase();
    await ensureSampleContextData(db);
    const laura = (await principalForUser(db, "user_laura", "EVALUATION"))!;
    const server = createContextMcpServer({ db, principal: laura, scopes: ["context:read"], model: () => new RecordedExtractionModel(RECORDED_EXTRACTION_PATH) });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "alias-test", version: "0.1.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    const names = (await client.listTools()).tools.map((tool) => tool.name);
    for (const name of ["search_context", "operational_memory_search", "get_entity_timeline", "relationship_traversal", "get_evidence", "evidence_retrieval", "start_capture", "bounded_context_capture"]) {
      expect(names).toContain(name);
    }
    const text = async (name: string, args: Record<string, unknown>) =>
      ((await client.callTool({ name, arguments: args })).content as Array<{ text: string }>)[0].text;
    expect(await text("operational_memory_search", { query: "invoices" })).toBe(await text("search_context", { query: "invoices" }));
    expect(await text("evidence_retrieval", { evidence_id: "missing" })).toBe(await text("get_evidence", { evidence_id: "missing" }));
    await client.close();
    await db.$disconnect();
  });
});
