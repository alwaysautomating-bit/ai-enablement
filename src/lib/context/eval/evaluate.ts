import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Db } from "../../db";
import { createContextMcpServer } from "../../../mcp/context-server";
import { startCapture } from "../capture-service";
import { normalizeName } from "../entities";
import { envelopeAllows, parseEnvelope } from "../envelope";
import type { ExtractionModel } from "../extraction/model";
import type { Stabilizer } from "../stabilizer";
import { locateQuote } from "../extraction/verify";
import { principalForUser } from "../principal";
import { reviewAssertion } from "../review-service";
import { ensureSampleContextData } from "../sample-data";
import type { Principal } from "../types";

// Synthetic evaluation of the complete loop:
// source evidence → conversation reconstruction → candidate assertion → provenance →
// review → confirmed context → temporal relationship → MCP retrieval.
//
// The gold file describes expected outcomes in terms of entities, cited messages, and
// times — not wording — so any extractor can be scored. The simulated reviewer confirms
// only what the gold file expects; everything else is marked not useful.

type GoldEntity = { key: string; person?: string; names?: string[]; distinctFrom?: string[] };
type GoldAssertion = {
  key: string;
  description: string;
  kinds: string[];
  subject?: string;
  object?: string;
  eitherOrientation?: boolean;
  anyEntity?: string[];
  supportedBy: string[];
  mustCite?: string[];
  statementMustContain?: string[];
  statementMustNotContain?: string[];
  operationalStatus?: string[];
  effectiveFrom?: string;
  effectiveToleranceDays?: number;
  communicatedLaterThanEffective?: boolean;
  holderGroup?: string;
  restrictedFrom?: "otherViewer";
  required: boolean;
};
type GoldTrap = {
  key: string;
  type: "SARCASM" | "QUESTION" | "HYPOTHETICAL" | "FORBIDDEN_RELATIONSHIP" | "FORBIDDEN_MERGE";
  messages?: string[];
  forbid?: {
    subject?: string;
    object?: string;
    involves?: string;
    kinds: string[];
    operationalStatus: string[];
    effectiveOnOrAfter?: string;
  };
  entities?: string[];
  rule: string;
};
export type Gold = {
  corpusId: string;
  capture: {
    user: string;
    question: string;
    windowStart: string;
    windowEnd: string;
    places: Array<{ provider: string; scopeType: string; value: string }>;
  };
  otherViewer: { user: string; email: string };
  entities: GoldEntity[];
  assertions: GoldAssertion[];
  traps: GoldTrap[];
  neverCollected: Array<{ message: string; reason: string }>;
  duplicates: Array<{ message: string; duplicateOf: string }>;
  crossChannelLinks: Array<[string, string]>;
  timeline: {
    holderGroup: string;
    object: string;
    expected: Array<{ holder: string; validFrom?: string; validTo?: string | null }>;
    toleranceDays: number;
  };
  questions: Array<{ key: string; as: string; query: string; expectConfirmedHolder?: string; expectNotVisible?: string[] }>;
};

export type Check = { name: string; passed: boolean; detail: string };

export type EvaluationReport = {
  corpusId: string;
  extractor: string;
  versions: { pork: string | null; same: string | null; stabilizer: string | null; goldPath: string };
  passed: boolean;
  metrics: Record<string, number>;
  checks: Check[];
  assertions: Array<{ key: string; required: boolean; matched: boolean; statement: string | null; notes: string[] }>;
  extras: string[];
  rejectedBeforeReview: Array<{ statement: string; reason: string }>;
};

export const PASS_THRESHOLDS = {
  requiredRecall: 0.8,
  quoteValidity: 1,
  chronologyAccuracy: 0.8,
};

const DAY = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: string) {
  return Math.abs(a.getTime() - new Date(`${b}T00:00:00Z`).getTime()) / DAY;
}

export async function evaluate(options: {
  db: Db;
  model: ExtractionModel;
  goldPath: string;
  stabilizer?: Stabilizer;
}): Promise<EvaluationReport> {
  const { db, model } = options;
  const gold = JSON.parse(readFileSync(resolve(process.cwd(), options.goldPath), "utf8")) as Gold;
  const checks: Check[] = [];
  const check = (name: string, passed: boolean, detail: string) => checks.push({ name, passed, detail });

  await ensureSampleContextData(db);
  const owner = (await principalForUser(db, gold.capture.user, "EVALUATION"))!;
  const other = (await principalForUser(db, gold.otherViewer.user, "EVALUATION"))!;

  // 1. Capture: collection, reconstruction, extraction, verification.
  const grants = await db.sourceGrant.findMany({ where: { userId: owner.userId } });
  const scopes = gold.capture.places.map((place) => {
    const grant = grants.find((candidate) => candidate.provider === place.provider);
    if (!grant) throw new Error(`No sample grant for ${place.provider}`);
    return { grantId: grant.id, scopeType: place.scopeType, value: place.value, label: place.value };
  });
  const { captureId, stats } = await startCapture(
    db,
    owner,
    {
      question: gold.capture.question,
      windowStart: new Date(`${gold.capture.windowStart}T00:00:00Z`),
      windowEnd: new Date(`${gold.capture.windowEnd}T23:59:59Z`),
      scopes,
    },
    model,
    options.stabilizer,
  );

  const collected = await db.evidence.findMany({ where: { organizationId: owner.organizationId } });
  const byExternal = new Map(collected.map((evidence) => [evidence.externalId, evidence]));
  const leaks = gold.neverCollected.filter((item) => byExternal.has(item.message));
  check(
    "Out-of-reach messages were never collected",
    leaks.length === 0,
    leaks.length ? `Collected: ${leaks.map((l) => l.message).join(", ")}` : `${gold.neverCollected.length} withheld messages stayed out`,
  );

  const links = await db.captureEvidence.findMany({ where: { captureId } });
  const linkByExternal = new Map(
    links.map((link) => [collected.find((evidence) => evidence.id === link.evidenceId)!.externalId, link]),
  );
  const duplicateMisses = gold.duplicates.filter(
    (item) => linkByExternal.get(item.message)?.duplicateOfEvidenceId !== byExternal.get(item.duplicateOf)?.id,
  );
  check(
    "Duplicates were recognized",
    duplicateMisses.length === 0,
    duplicateMisses.length ? `Missed: ${duplicateMisses.map((d) => d.message).join(", ")}` : `${gold.duplicates.length} found`,
  );
  const linkMisses = gold.crossChannelLinks.filter(
    ([a, b]) => !linkByExternal.get(a)?.conversationId || linkByExternal.get(a)?.conversationId !== linkByExternal.get(b)?.conversationId,
  );
  check(
    "Related threads were reconstructed into one conversation",
    linkMisses.length === 0,
    linkMisses.length ? `Not linked: ${linkMisses.map((pair) => pair.join(" + ")).join("; ")}` : `${gold.crossChannelLinks.length} links`,
  );

  // 2. Score candidate assertions against gold.
  const assertions = await db.assertion.findMany({
    where: { captureId },
    include: {
      evidence: { include: { evidence: true } },
      subjectEntity: { include: { aliases: true, identities: true } },
      objectEntity: { include: { aliases: true, identities: true } },
    },
  });
  type Row = (typeof assertions)[number];
  type EntityRow = NonNullable<Row["subjectEntity"]>;
  const goldEntity = new Map(gold.entities.map((entity) => [entity.key, entity]));
  // Entities match gold only by identifier, name, or alias. There is deliberately no leniency
  // for derived descriptions like "<Org> approvals": turning those into the right entity is
  // SAME's job, and this evaluation must fail if stabilization does not do it.
  // Rules, decisions, and questions may name their subject only in the statement; for those
  // kinds the statement is checked by the longest gold name it contains.
  const namedEntities = gold.entities.filter((entity) => entity.names);
  const containsWords = (haystack: string, needle: string) =>
    needle.length > 0 && ` ${haystack} `.includes(` ${needle} `);
  const aboutKey = (text: string) => {
    const normalized = normalizeName(text);
    let best: { key: string; length: number } | null = null;
    for (const entity of namedEntities) {
      for (const name of entity.names!.map(normalizeName)) {
        if (containsWords(normalized, name) && (!best || name.length > best.length)) best = { key: entity.key, length: name.length };
      }
    }
    return best?.key ?? null;
  };
  const entityMatches = (entity: EntityRow | null, key: string | undefined) => {
    if (!entity || !key) return false;
    const target = goldEntity.get(key);
    if (!target) return false;
    if (target.person) return entity.identities.some((identity) => identity.identityKey === `email:${target.person}`);
    const names = new Set((target.names ?? []).map(normalizeName));
    return [entity.canonicalName, ...entity.aliases.map((alias) => alias.alias)].some((name) => names.has(normalizeName(name)));
  };
  const statementMentions = (row: Row, key: string) =>
    !["RELATIONSHIP", "RESPONSIBILITY"].includes(row.kind) && aboutKey(row.statement) === key;
  const supportIds = (row: Row) => row.evidence.filter((e) => e.role === "SUPPORTS").map((e) => e.evidence.externalId);
  const citedIds = (row: Row) => row.evidence.map((e) => e.evidence.externalId);

  const matchedRows = new Map<string, Row>();
  const assertionResults: EvaluationReport["assertions"] = [];
  let chronologyChecked = 0;
  let chronologyCorrect = 0;

  for (const expected of gold.assertions) {
    const candidates = assertions.filter((row) => {
      if (!expected.kinds.includes(row.kind)) return false;
      if (!supportIds(row).some((id) => expected.supportedBy.includes(id))) return false;
      if (expected.mustCite && !expected.mustCite.every((id) => citedIds(row).includes(id))) return false;
      if (expected.operationalStatus && !expected.operationalStatus.includes(row.operationalStatus)) return false;
      const text = row.statement.toLowerCase();
      if (expected.statementMustContain && !expected.statementMustContain.every((t) => text.includes(t.toLowerCase()))) return false;
      if (expected.statementMustNotContain?.some((t) => text.includes(t.toLowerCase()))) return false;
      if (expected.subject || expected.object) {
        const direct = entityMatches(row.subjectEntity, expected.subject) && entityMatches(row.objectEntity, expected.object);
        const reversed =
          expected.eitherOrientation &&
          entityMatches(row.subjectEntity, expected.object) &&
          entityMatches(row.objectEntity, expected.subject);
        if (!direct && !reversed) return false;
      }
      if (expected.anyEntity) {
        const any = expected.anyEntity.some(
          (key) =>
            entityMatches(row.subjectEntity, key) || entityMatches(row.objectEntity, key) || statementMentions(row, key),
        );
        if (!any) return false;
      }
      return !Array.from(matchedRows.values()).includes(row);
    });
    const best = candidates.sort((a, b) => b.confidence - a.confidence)[0];
    const notes: string[] = [];
    if (best) {
      matchedRows.set(expected.key, best);
      if (expected.effectiveFrom) {
        chronologyChecked += 1;
        const withinTolerance =
          best.effectiveFrom !== null && daysBetween(best.effectiveFrom, expected.effectiveFrom) <= (expected.effectiveToleranceDays ?? 0);
        const basisOk = !expected.communicatedLaterThanEffective || best.timeBasis !== "COMMUNICATION_TIME";
        if (withinTolerance && basisOk) chronologyCorrect += 1;
        else
          notes.push(
            `Operational time ${best.effectiveFrom?.toISOString().slice(0, 10) ?? "missing"} (${best.timeBasis}); expected ${expected.effectiveFrom}.`,
          );
      }
    } else {
      notes.push("No matching candidate.");
    }
    assertionResults.push({ key: expected.key, required: expected.required, matched: Boolean(best), statement: best?.statement ?? null, notes });
  }

  const required = gold.assertions.filter((a) => a.required);
  const requiredRecall = required.filter((a) => matchedRows.has(a.key)).length / required.length;
  const chronologyAccuracy = chronologyChecked ? chronologyCorrect / chronologyChecked : 1;
  const extras = assertions.filter((row) => !Array.from(matchedRows.values()).includes(row)).map((row) => row.statement);

  let quotes = 0;
  let validQuotes = 0;
  for (const row of assertions) {
    for (const link of row.evidence) {
      quotes += 1;
      if (locateQuote(link.evidence.excerpt, link.quote)) validQuotes += 1;
    }
  }
  const quoteValidity = quotes ? validQuotes / quotes : 1;

  check(`Required context found (≥ ${PASS_THRESHOLDS.requiredRecall * 100}%)`, requiredRecall >= PASS_THRESHOLDS.requiredRecall, `${(requiredRecall * 100).toFixed(0)}% of ${required.length}`);
  check("Every shown quote exists in its source", quoteValidity >= PASS_THRESHOLDS.quoteValidity, `${validQuotes}/${quotes} verified; ${stats.rejected.length} rejected before review`);
  check(
    `Operational time separated from message time (≥ ${PASS_THRESHOLDS.chronologyAccuracy * 100}%)`,
    chronologyAccuracy >= PASS_THRESHOLDS.chronologyAccuracy,
    `${chronologyCorrect}/${chronologyChecked} dated items correct`,
  );

  // 3. Traps.
  const trapViolations: string[] = [];
  for (const trap of gold.traps) {
    if (trap.messages) {
      const bad = assertions.filter((row) => {
        const supports = supportIds(row);
        return (
          supports.length > 0 &&
          supports.every((id) => trap.messages!.includes(id)) &&
          row.modality === "STATED" &&
          row.confidence >= 0.6
        );
      });
      if (bad.length) trapViolations.push(`${trap.key}: ${bad.map((row) => row.statement).join(" | ")}`);
    }
    if (trap.forbid) {
      const forbid = trap.forbid;
      const bad = assertions.filter((row) => {
        if (!forbid.kinds.includes(row.kind) || !forbid.operationalStatus.includes(row.operationalStatus)) return false;
        if (forbid.subject && !entityMatches(row.subjectEntity, forbid.subject)) return false;
        if (forbid.object && !entityMatches(row.objectEntity, forbid.object)) return false;
        if (forbid.involves && !entityMatches(row.subjectEntity, forbid.involves) && !entityMatches(row.objectEntity, forbid.involves)) return false;
        if (forbid.effectiveOnOrAfter) {
          const when = row.effectiveFrom ?? row.firstCommunicatedAt;
          if (when < new Date(`${forbid.effectiveOnOrAfter}T00:00:00Z`)) return false;
        }
        return true;
      });
      if (bad.length) trapViolations.push(`${trap.key}: ${bad.map((row) => row.statement).join(" | ")}`);
    }
    if (trap.type === "FORBIDDEN_MERGE" && trap.entities) {
      const entities = await db.opEntity.findMany({
        where: { organizationId: owner.organizationId },
        include: { aliases: true, identities: true },
      });
      const merged = entities.filter((entity) => trap.entities!.every((key) => entityMatches(entity, key)));
      if (merged.length) trapViolations.push(`${trap.key}: ${merged.map((entity) => entity.canonicalName).join(", ")}`);
    }
  }
  check("No traps turned into confident facts", trapViolations.length === 0, trapViolations.length ? trapViolations.join("; ") : `${gold.traps.length} traps avoided`);

  // 4. Before review: candidates are distinguishable and invisible to others.
  const [ownerClient, otherClient] = await Promise.all([mcpClient(db, owner, model), mcpClient(db, other, model)]);
  const preReview = await callTool(ownerClient, "search_context", { query: "Turner", include_unreviewed: true });
  check(
    "Unreviewed candidates are labelled and not treated as confirmed",
    preReview.confirmed.length === 0 &&
      preReview.candidates.length > 0 &&
      preReview.candidates.every((c: { status: string }) => c.status === "UNREVIEWED_CANDIDATE"),
    `${preReview.confirmed.length} confirmed, ${preReview.candidates.length} labelled candidates`,
  );
  const otherPreReview = await callTool(otherClient, "search_context", { query: "Turner", include_unreviewed: true });
  check(
    "Another person sees none of someone else's candidates",
    otherPreReview.confirmed.length === 0 && otherPreReview.candidates.length === 0,
    `${otherPreReview.candidates.length} candidates visible to ${other.displayName}`,
  );

  // 5. Simulated review in reverse chronological order, to prove out-of-order confirmation
  //    still yields a correct timeline.
  const toConfirm = [...matchedRows.entries()].sort(
    ([, a], [, b]) => (b.effectiveFrom ?? b.firstCommunicatedAt).getTime() - (a.effectiveFrom ?? a.firstCommunicatedAt).getTime(),
  );
  const factByGold = new Map<string, string>();
  for (const [key, row] of toConfirm) {
    const outcome = await reviewAssertion(db, owner, row.id, { decision: "CONFIRM", visibility: "SOURCE_AUDIENCE" });
    if (outcome.factId) factByGold.set(key, outcome.factId);
  }
  for (const row of assertions.filter((row) => !Array.from(matchedRows.values()).includes(row))) {
    await reviewAssertion(db, owner, row.id, { decision: "NOT_USEFUL", visibility: "OWNER" });
  }
  const remaining = await db.assertion.count({ where: { captureId, status: "NEEDS_REVIEW" } });
  check("Every candidate received a human decision", remaining === 0, `${remaining} left unreviewed`);

  // 6. Temporal relationships.
  const holderRows = gold.assertions
    .filter((a) => a.holderGroup === gold.timeline.holderGroup)
    .map((a) => matchedRows.get(a.key))
    .filter((row): row is Row => Boolean(row));
  const objectEntityId = holderRows[0]?.objectEntity?.id;
  const timeline = objectEntityId ? await callTool(ownerClient, "get_entity_timeline", { entity: objectEntityId }) : null;
  const predicates = new Set(holderRows.map((row) => row.predicate));
  const timelineIssues: string[] = [];
  for (const expected of gold.timeline.expected) {
    const person = goldEntity.get(expected.holder)!.person;
    const holderEntity = holderRows.find((row) => entityMatches(row.subjectEntity, expected.holder))?.subjectEntity;
    const entry = timeline?.timeline.find(
      (item: { from: { id: string }; predicate: string }) => item.from.id === holderEntity?.id && predicates.has(item.predicate),
    );
    if (!entry) {
      timelineIssues.push(`${person}: missing`);
      continue;
    }
    const { validFrom, validTo } = entry.operationalTime as { validFrom: string | null; validTo: string | null };
    if (expected.validFrom && (!validFrom || daysBetween(new Date(validFrom), expected.validFrom) > gold.timeline.toleranceDays)) {
      timelineIssues.push(`${person}: starts ${validFrom}, expected ${expected.validFrom}`);
    }
    if (expected.validTo === null && validTo) timelineIssues.push(`${person}: ended ${validTo}, expected current`);
    if (expected.validTo && (!validTo || daysBetween(new Date(validTo), expected.validTo) > gold.timeline.toleranceDays)) {
      timelineIssues.push(`${person}: ends ${validTo}, expected ${expected.validTo}`);
    }
  }
  const predicateConsistent = predicates.size === 1;
  if (!predicateConsistent) timelineIssues.push(`holders use different predicates: ${[...predicates].join(", ")}`);
  check(
    "Changes over time form one correct timeline (none overwritten)",
    timelineIssues.length === 0,
    timelineIssues.length ? timelineIssues.join("; ") : `${gold.timeline.expected.length} holders in order`,
  );

  // 7. MCP retrieval with provenance and permission boundaries.
  for (const question of gold.questions) {
    const client = question.as === owner.userId ? ownerClient : otherClient;
    const viewer = question.as === owner.userId ? owner : other;
    const answer = await callTool(client, "search_context", { query: question.query, include_unreviewed: true });
    if (question.expectConfirmedHolder) {
      const holder = goldEntity.get(question.expectConfirmedHolder)!;
      const holderRow = holderRows.find((row) => entityMatches(row.subjectEntity, question.expectConfirmedHolder));
      const hit = answer.confirmed.find(
        (item: { subject: { id: string } | null; relationships: Array<{ current: boolean }>; provenance: unknown[] }) =>
          item.subject?.id === holderRow?.subjectEntity?.id && item.relationships.some((r) => r.current) && item.provenance.length > 0,
      );
      check(
        `MCP answers "${question.query}" with the current holder and provenance`,
        Boolean(hit),
        hit ? `${holder.person} with ${hit.provenance.length} source(s)` : "Current holder not returned with provenance",
      );
    }
    if (question.expectNotVisible) {
      const hidden = question.expectNotVisible.map((key) => factByGold.get(key)).filter(Boolean);
      const leaked = answer.confirmed.filter((item: { factId: string }) => hidden.includes(item.factId));
      const outsideEnvelope = [];
      for (const item of answer.confirmed as Array<{ factId: string }>) {
        const fact = await db.operationalFact.findUniqueOrThrow({ where: { id: item.factId } });
        if (!envelopeAllows(parseEnvelope(fact.envelope), viewer)) outsideEnvelope.push(item.factId);
      }
      check(
        `Restricted context stays hidden from ${viewer.displayName}`,
        leaked.length === 0 && outsideEnvelope.length === 0 && answer.candidates.length === 0,
        `${answer.confirmed.length} visible, ${leaked.length} restricted leaked, ${outsideEnvelope.length} outside their access`,
      );
      const restrictedEvidence = collected.find((evidence) => evidence.externalId === "sl-0819-d");
      if (restrictedEvidence) {
        const direct = await callTool(otherClient, "get_evidence", { evidence_id: restrictedEvidence.id });
        check(`${viewer.displayName} cannot open restricted evidence directly`, direct.found === false, JSON.stringify(direct).slice(0, 80));
      }
    }
  }

  await Promise.all([ownerClient.close(), otherClient.close()]);

  const passed = checks.every((item) => item.passed);
  return {
    corpusId: gold.corpusId,
    extractor: model.id,
    versions: {
      pork: stats.pork?.version ?? null,
      same: stats.stabilization ? `${stats.stabilization.contract} ${stats.stabilization.sameVersion} (registry v${stats.stabilization.registryVersion})` : null,
      stabilizer: stats.stabilization?.stabilizer ?? null,
      goldPath: options.goldPath,
    },
    passed,
    metrics: {
      messagesRead: stats.messagesRead,
      conversations: stats.conversations,
      candidates: stats.proposed,
      rejectedBeforeReview: stats.rejected.length,
      requiredRecall,
      quoteValidity,
      chronologyAccuracy,
      trapViolations: trapViolations.length,
      extras: extras.length,
    },
    checks,
    assertions: assertionResults,
    extras,
    rejectedBeforeReview: stats.rejected,
  };
}

async function mcpClient(db: Db, principal: Principal, model: ExtractionModel) {
  const server = createContextMcpServer({
    db,
    principal: { ...principal, via: "MCP_CLIENT", clientName: "evaluation" },
    scopes: ["context:read", "capture:start"],
    model: () => model,
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "context-evaluation", version: "0.1.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callTool(client: Client, name: string, args: Record<string, unknown>): Promise<any> {
  const response = await client.callTool({ name, arguments: args });
  const content = response.content as Array<{ type: string; text: string }>;
  const text = content.find((item) => item.type === "text")?.text ?? "null";
  if (response.isError) throw new Error(`${name} failed: ${text}`);
  return JSON.parse(text);
}

export function formatReport(report: EvaluationReport) {
  const lines = [
    `Context Capture evaluation — ${report.corpusId} — extractor ${report.extractor}`,
    `PORK ${report.versions.pork} · SAME ${report.versions.same} via ${report.versions.stabilizer}`,
    `Result: ${report.passed ? "PASS" : "FAIL"}`,
    "",
    ...report.checks.map((item) => `${item.passed ? "✓" : "✗"} ${item.name} — ${item.detail}`),
    "",
    "Expected context:",
    ...report.assertions.map(
      (item) =>
        `  ${item.matched ? "✓" : item.required ? "✗" : "·"} ${item.key}${item.required ? "" : " (optional)"}${
          item.statement ? ` — ${item.statement}` : ""
        }${item.notes.length ? `\n      ${item.notes.join(" ")}` : ""}`,
    ),
  ];
  if (report.extras.length) lines.push("", `Other candidates (marked not useful by the simulated reviewer): ${report.extras.length}`, ...report.extras.map((s) => `  · ${s}`));
  if (report.rejectedBeforeReview.length)
    lines.push("", "Rejected before review:", ...report.rejectedBeforeReview.map((r) => `  · ${r.statement} — ${r.reason}`));
  return lines.join("\n");
}
