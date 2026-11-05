import type { Db, DbClient } from "../db";
import { adapterFor } from "./adapters/registry";
import { ScopeRefusedError, type GrantRecord, type ScopeSelection } from "./adapters/types";
import { audit } from "./audit";
import { assertCaptureTransition, CAPTURE_STATUS } from "./capture-state";
import { addAlias, identityKeyFor, resolveSourceIdentity, widenEntityEnvelope } from "./entities";
import { envelopeAllows, intersectAll, parseEnvelope, serializeEnvelope, sharedItemAllows } from "./envelope";
import type { ExtractionModel } from "./extraction/model";
import { buildUserPrompt, type PromptContext } from "./extraction/prompt";
import type { ExtractedAssertion, ExtractedEntity, ExtractionOutput } from "./extraction/schema";
import { locateQuote } from "./extraction/verify";
import { assertLiveUseAllowed, CONTEXT_CAPTURE_REQUIRED_CLASSES, PermissionGateError } from "./permissions";
import { CONTEXT_CAPTURE_CAPABILITY, contextCaptureExtraction } from "./pork";
import { reconstruct, type NormalizedMessage, type ReconstructedConversation } from "./reconstruct";
import {
  defaultStabilizer,
  StabilizationUnavailableError,
  STABILIZATION_CONTRACT,
  type StabilizationRequest,
  type StabilizationResponse,
  type Stabilizer,
  type Target,
} from "./stabilizer";
import {
  bucketForKind,
  ENTITY_TYPES,
  TIME_BASIS,
  type AccessEnvelope,
  type AssertionKind,
  type Principal,
  type SourceMessage,
} from "./types";

// Context Capture pipeline:
//   permission gate → collect (read-only, bounded) → reconstruct conversations →
//   extract with the pinned PORK skill → verify quotes → SAME semantic stabilization →
//   one atomic write of evidence, candidates, and provenance.
// Nothing is stored unless every step succeeds. SAME decides how extracted language maps to
// entities and relationships; this service only materializes those decisions.

export const MAX_MESSAGES_PER_CAPTURE = 500;
const BATCH_CHARACTER_BUDGET = 60_000;

export type StartCaptureInput = {
  question: string;
  windowStart: Date | null;
  windowEnd: Date | null;
  scopes: Array<ScopeSelection & { grantId: string }>;
};

export class CaptureInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaptureInputError";
  }
}

type VerifiedAssertion = {
  batch: number;
  source: ExtractedAssertion;
  entities: Map<string, ExtractedEntity>;
  evidence: Array<{ messageId: string; role: string; quote: string; start: number; end: number }>;
  envelope: AccessEnvelope;
  firstCommunicatedAt: Date;
  lastCommunicatedAt: Date;
};

export type CaptureStats = {
  messagesRead: number;
  byProvider: Record<string, number>;
  conversations: number;
  duplicates: number;
  cited: number;
  setAside: number;
  proposed: number;
  rejected: Array<{ statement: string; reason: string }>;
  buckets: Record<string, number>;
  stabilization?: {
    contract: string;
    sameVersion: string;
    registryVersion: number;
    stabilizer: string;
    entityResolutions: Record<string, number>;
    flags: Record<string, number>;
  };
  pork?: { capability: string; version: string };
};

const VALID_ENTITY_TYPES = new Set<string>(ENTITY_TYPES);

function parseDay(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function loadGrants(db: DbClient, principal: Principal, grantIds: string[]) {
  const grants = await db.sourceGrant.findMany({ where: { id: { in: grantIds } } });
  for (const id of grantIds) {
    const grant = grants.find((candidate) => candidate.id === id);
    if (!grant || grant.userId !== principal.userId || grant.organizationId !== principal.organizationId) {
      throw new CaptureInputError("One of the chosen sources is not connected to your account.");
    }
    if (grant.status !== "ACTIVE") throw new CaptureInputError(`${grant.accountLabel} is disconnected.`);
    // L0 grants are read-only. A write-capable grant must never be used by this job.
    if (grant.accessMode !== "READ") throw new CaptureInputError("Context capture only uses read-only connections.");
  }
  return grants as GrantRecord[];
}

export function isLiveGrant(grant: { provider: string }) {
  return !grant.provider.startsWith("FIXTURE_");
}

async function buildPromptContext(
  db: DbClient,
  principal: Principal,
  question: string,
  input: StartCaptureInput,
  messages: NormalizedMessage[],
): Promise<PromptContext> {
  const people = new Map<string, { identityKey: string; displayName: string; aliases: Set<string> }>();
  for (const message of messages) {
    for (const identity of [message.author, ...message.recipients]) {
      const key = identityKeyFor(identity);
      if (!people.has(key)) people.set(key, { identityKey: key, displayName: identity.displayName, aliases: new Set() });
      const person = people.get(key)!;
      if (identity.displayName !== person.displayName) person.aliases.add(identity.displayName);
    }
  }
  const identities = await db.sourceIdentity.findMany({
    where: { organizationId: principal.organizationId, identityKey: { in: [...people.keys()] } },
  });
  for (const identity of identities) {
    const person = people.get(identity.identityKey);
    if (person && identity.displayName !== person.displayName) person.aliases.add(identity.displayName);
  }

  // Only context this person may already see is shown to the model.
  const entities = await db.opEntity.findMany({
    where: { organizationId: principal.organizationId, entityType: { not: "PERSON" }, status: { in: ["CANDIDATE", "CONFIRMED"] } },
    include: { aliases: true },
    take: 300,
  });
  const facts = await db.operationalFact.findMany({
    where: { organizationId: principal.organizationId, status: "ACTIVE" },
    orderBy: { establishedAt: "desc" },
    take: 300,
  });
  const relationships = await db.relationship.findMany({
    where: { organizationId: principal.organizationId },
    select: { predicate: true, envelope: true, sharing: true, ownerId: true, organizationId: true },
  });

  return {
    question,
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    people: [...people.values()].map((p) => ({ identityKey: p.identityKey, displayName: p.displayName, aliases: [...p.aliases] })),
    knownEntities: entities
      .filter((entity) => envelopeAllows(parseEnvelope(entity.envelope), principal))
      .map((entity) => ({
        name: entity.canonicalName,
        entityType: entity.entityType,
        aliases: entity.aliases.map((alias) => alias.alias).filter((alias) => alias !== entity.canonicalName),
      })),
    existingFacts: facts
      .filter((fact) => sharedItemAllows(fact, principal))
      .map((fact) => ({ id: fact.id, statement: fact.statement, predicate: fact.predicate, effectiveFrom: fact.effectiveFrom })),
    existingPredicates: [
      ...new Set(relationships.filter((r) => sharedItemAllows(r, principal)).map((r) => r.predicate)),
    ].sort(),
  };
}

function batchConversations(conversations: ReconstructedConversation[], messages: Map<string, NormalizedMessage>) {
  const batches: ReconstructedConversation[][] = [];
  let current: ReconstructedConversation[] = [];
  let size = 0;
  for (const conversation of conversations) {
    const length = conversation.messageIds.reduce((total, id) => total + (messages.get(id)?.excerpt.length ?? 0) + 200, 0);
    if (current.length && size + length > BATCH_CHARACTER_BUDGET) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(conversation);
    size += length;
  }
  if (current.length) batches.push(current);
  return batches;
}

/** Deterministic checks between the model and a person. Nothing unverifiable is shown. */
export function verifyExtraction(
  output: ExtractionOutput,
  batchMessages: Map<string, NormalizedMessage>,
  rejected: CaptureStats["rejected"],
  batch = 0,
): VerifiedAssertion[] {
  const entities = new Map(output.entities.map((entity) => [entity.ref, entity]));
  const verified: VerifiedAssertion[] = [];

  for (const assertion of output.assertions) {
    const evidence: VerifiedAssertion["evidence"] = [];
    for (const item of assertion.evidence) {
      const message = batchMessages.get(item.messageId);
      if (!message) continue;
      const location = locateQuote(message.excerpt, item.quote);
      if (!location) continue;
      evidence.push({
        messageId: item.messageId,
        role: item.role,
        quote: message.excerpt.slice(location.start, location.end),
        start: location.start,
        end: location.end,
      });
    }
    const unverifiable = assertion.evidence.length - evidence.length;
    if (!evidence.some((item) => item.role === "SUPPORTS")) {
      rejected.push({
        statement: assertion.statement,
        reason: unverifiable > 0 ? "Cited words were not found in the cited message." : "No supporting message was cited.",
      });
      continue;
    }
    const cited = evidence.map((item) => batchMessages.get(item.messageId)!);
    const times = cited.map((message) => message.communicatedAt.getTime());
    verified.push({
      batch,
      source: assertion,
      entities,
      evidence,
      envelope: intersectAll(cited.map((message) => message.envelope)),
      firstCommunicatedAt: new Date(Math.min(...times)),
      lastCommunicatedAt: new Date(Math.max(...times)),
    });
  }
  return verified;
}

const entityRef = (batch: number, ref: string) => `b${batch}:${ref}`;
const assertionRef = (index: number) => `a${String(index).padStart(4, "0")}`;
const isoDay = (date: Date | null) => (date ? date.toISOString().slice(0, 10) : null);

/** Build the SAME request from permission-filtered context and verified candidates. */
async function buildStabilizationRequest(
  db: DbClient,
  principal: Principal,
  captureId: string,
  outputs: Array<{ batch: number; output: ExtractionOutput }>,
  verified: VerifiedAssertion[],
): Promise<StabilizationRequest> {
  const entities = await db.opEntity.findMany({
    where: { organizationId: principal.organizationId, status: { in: ["CANDIDATE", "CONFIRMED"] } },
    include: { aliases: true, identities: true },
    take: 2000,
  });
  const relationships = await db.relationship.findMany({
    where: { organizationId: principal.organizationId, status: "ACTIVE" },
  });

  const extractedEntities: StabilizationRequest["extracted"]["entities"] = [];
  for (const { batch, output } of outputs) {
    for (const entity of output.entities) {
      extractedEntities.push({
        ref: entityRef(batch, entity.ref),
        name: entity.name,
        type: VALID_ENTITY_TYPES.has(entity.type) ? entity.type : "OTHER",
        aliases: entity.aliases,
        identity_key: entity.identityKey,
        distinct_from: entity.distinctFrom.map((other) => entityRef(batch, other)),
      });
    }
  }

  return {
    contract: STABILIZATION_CONTRACT,
    request_id: captureId,
    known_entities: entities
      .filter((entity) => envelopeAllows(parseEnvelope(entity.envelope), principal))
      .map((entity) => ({
        id: entity.id,
        type: entity.entityType,
        names: [...new Set([entity.canonicalName, ...entity.aliases.map((alias) => alias.alias)])],
        identity_keys: [...new Set(entity.identities.map((identity) => identity.identityKey))],
      })),
    known_relationships: relationships
      .filter((relationship) => sharedItemAllows(relationship, principal))
      .map((relationship) => ({
        id: relationship.id,
        subject: relationship.fromEntityId,
        predicate: relationship.predicate,
        object: relationship.toEntityId,
        valid_from: isoDay(relationship.validFrom),
        valid_to: isoDay(relationship.validTo),
        holder_cardinality: relationship.holderCardinality,
      })),
    extracted: {
      entities: extractedEntities,
      assertions: verified.map((item, index) => ({
        ref: assertionRef(index),
        kind: item.source.kind,
        statement: item.source.statement,
        subject_ref: item.source.subjectRef && item.entities.has(item.source.subjectRef) ? entityRef(item.batch, item.source.subjectRef) : null,
        predicate: item.source.predicate,
        object_ref: item.source.objectRef && item.entities.has(item.source.objectRef) ? entityRef(item.batch, item.source.objectRef) : null,
        holder_cardinality: item.source.holderCardinality,
        operational_status: item.source.operationalStatus,
        modality: item.source.modality,
        confidence: item.source.confidence,
        effective_from: item.source.effectiveFrom,
        effective_to: item.source.effectiveTo,
        time_basis: item.source.timeBasis,
        time_expression: item.source.timeExpression,
        communicated: { first: item.firstCommunicatedAt.toISOString(), last: item.lastCommunicatedAt.toISOString() },
      })),
    },
  };
}

/** Turns SAME's entity decisions into workspace entities, creating only what is referenced. */
function entityMaterializer(
  tx: DbClient,
  principal: Principal,
  captureId: string,
  request: StabilizationRequest,
  response: StabilizationResponse,
) {
  const decisions = new Map(response.entities.map((decision) => [decision.ref, decision]));
  const derived = new Map(response.derived_entities.map((entity) => [entity.ref, entity]));
  const extracted = new Map(request.extracted.entities.map((entity) => [entity.ref, entity]));
  const created = new Map<string, string>();

  const createCandidate = async (key: string, name: string, type: string, aliases: string[], basis: string, envelope: AccessEnvelope) => {
    const entity = await tx.opEntity.create({
      data: {
        organizationId: principal.organizationId,
        entityType: VALID_ENTITY_TYPES.has(type) ? type : "OTHER",
        canonicalName: name,
        status: "CANDIDATE",
        envelope: serializeEnvelope(envelope),
        createdByCaptureId: captureId,
      },
    });
    for (const alias of new Set([name, ...aliases])) await addAlias(tx, entity.id, alias, basis);
    created.set(key, entity.id);
    return entity.id;
  };

  const resolveTarget = async (target: Target, envelope: AccessEnvelope, depth = 0): Promise<string | null> => {
    if (depth > 8) return null;
    if (target.kind === "known") {
      await widenEntityEnvelope(tx, target.id, envelope);
      return target.id;
    }
    const key = `${target.kind}:${target.ref}`;
    const existing = created.get(key);
    if (existing) {
      await widenEntityEnvelope(tx, existing, envelope);
      return existing;
    }
    if (target.kind === "derived") {
      const entity = derived.get(target.ref);
      if (!entity) return null;
      return createCandidate(key, entity.name, entity.type, [], "SAME_DERIVED_BASE", envelope);
    }
    const decision = decisions.get(target.ref);
    const mention = extracted.get(target.ref);
    if (!decision || !mention) return null;
    // People carry deterministic identifiers: link to the entity their source identity created.
    if (mention.identity_key) {
      const identity = await tx.sourceIdentity.findFirst({
        where: { organizationId: principal.organizationId, identityKey: mention.identity_key, entityId: { not: null } },
      });
      if (identity?.entityId) {
        for (const alias of [mention.name, ...mention.aliases]) await addAlias(tx, identity.entityId, alias, "SAME_IDENTIFIER");
        created.set(key, identity.entityId);
        return identity.entityId;
      }
    }
    if (["MATCHED", "MERGED", "COLLAPSED"].includes(decision.resolution) && decision.target) {
      const id = await resolveTarget(decision.target, envelope, depth + 1);
      if (id && decision.resolution !== "COLLAPSED") {
        // Same entity under another name: keep the name. A collapsed description is not an alias.
        for (const alias of [mention.name, ...mention.aliases]) await addAlias(tx, id, alias, `SAME_${decision.resolution}`);
      }
      if (id) created.set(key, id);
      return id;
    }
    return createCandidate(
      key,
      mention.name,
      decision.type,
      mention.aliases,
      decision.resolution === "AMBIGUOUS" ? "SAME_AMBIGUOUS" : "SAME_NEW_CANDIDATE",
      envelope,
    );
  };

  const describe = (ref: string | null) => {
    if (!ref) return null;
    const decision = decisions.get(ref);
    return decision
      ? {
          mention: decision.name,
          resolution: decision.resolution,
          reason: decision.reason,
          relationHint: decision.relation_hint,
          flags: decision.flags,
          candidates: decision.candidates.length,
        }
      : null;
  };

  return { resolveTarget, describe };
}

export async function startCapture(
  db: Db,
  principal: Principal,
  input: StartCaptureInput,
  model: ExtractionModel,
  stabilizer: Stabilizer = defaultStabilizer(),
) {
  const question = input.question.trim();
  if (question.length < 8) throw new CaptureInputError("Describe what you want to understand in a sentence.");
  if (input.scopes.length === 0) throw new CaptureInputError("Choose at least one place to look.");

  const grants = await loadGrants(db, principal, [...new Set(input.scopes.map((scope) => scope.grantId))]);
  if (model.id.startsWith("recorded:") && grants.some(isLiveGrant)) {
    throw new CaptureInputError("The recorded test extractor only runs on sample data. Configure a model first.");
  }
  // Live sources require an approval for this exact capability version and every required class.
  if (grants.some(isLiveGrant)) {
    try {
      assertLiveUseAllowed(CONTEXT_CAPTURE_CAPABILITY, CONTEXT_CAPTURE_REQUIRED_CLASSES);
    } catch (error) {
      if (error instanceof PermissionGateError) {
        await audit(db, principal, "CAPTURE_REFUSED_UNAPPROVED_VERSION", "CAPABILITY", CONTEXT_CAPTURE_CAPABILITY);
        throw new CaptureInputError(error.message);
      }
      throw error;
    }
  }
  const extraction = contextCaptureExtraction();

  const capture = await db.capture.create({
    data: {
      question,
      windowStart: input.windowStart,
      windowEnd: input.windowEnd,
      organizationId: principal.organizationId,
      createdById: principal.userId,
      scopes: {
        create: input.scopes.map((scope) => ({
          grantId: scope.grantId,
          scopeType: scope.scopeType,
          value: scope.value,
          label: scope.label,
        })),
      },
    },
  });
  await audit(db, principal, "CAPTURE_CREATED", "CAPTURE", capture.id, {
    scopes: input.scopes.length,
    liveSources: grants.some(isLiveGrant),
    porkVersion: extraction.version,
  });

  let status: string = capture.status;
  const moveTo = async (next: (typeof CAPTURE_STATUS)[keyof typeof CAPTURE_STATUS]) => {
    assertCaptureTransition(status, next);
    await db.capture.update({ where: { id: capture.id }, data: { status: next } });
    status = next;
  };

  try {
    await moveTo(CAPTURE_STATUS.COLLECTING);
    const collected: Array<SourceMessage & { grantId: string; provider: string }> = [];
    for (const grant of grants) {
      const adapter = adapterFor(grant.provider);
      const scopes = input.scopes.filter((scope) => scope.grantId === grant.id);
      const messages = await adapter.collect(grant, scopes, { start: input.windowStart, end: input.windowEnd });
      collected.push(...messages.map((message) => ({ ...message, grantId: grant.id, provider: grant.provider })));
    }
    if (collected.length > MAX_MESSAGES_PER_CAPTURE) {
      throw new CaptureInputError(
        `That would read ${collected.length} messages. Narrow the dates or places to under ${MAX_MESSAGES_PER_CAPTURE}.`,
      );
    }

    const reconstruction = reconstruct(collected);
    const messageById = new Map(reconstruction.messages.map((message) => [message.externalId, message]));
    const grantByMessage = new Map(collected.map((message) => [message.externalId, message]));

    await moveTo(CAPTURE_STATUS.EXTRACTING);
    const promptContext = await buildPromptContext(db, principal, question, input, reconstruction.messages);
    const rejected: CaptureStats["rejected"] = [];
    const verified: VerifiedAssertion[] = [];
    const outputs: Array<{ batch: number; output: ExtractionOutput }> = [];
    const batches = batchConversations(reconstruction.conversations, messageById);
    for (const [index, batch] of batches.entries()) {
      const batchIds = batch.flatMap((conversation) => conversation.messageIds);
      const batchMessages = new Map(batchIds.map((id) => [id, messageById.get(id)!]));
      const output = await model.extract({
        system: extraction.instructions,
        user: buildUserPrompt(promptContext, batch, batchMessages),
        messageIds: batchIds,
      });
      outputs.push({ batch: index, output });
      verified.push(...verifyExtraction(output, batchMessages, rejected, index));
    }
    const visibleFactIds = new Set(promptContext.existingFacts.map((fact) => fact.id));

    await moveTo(CAPTURE_STATUS.RESOLVING);
    // Semantic stabilization happens before anything is stored. Unavailable → fail closed.
    const stabilizationRequest = await buildStabilizationRequest(db, principal, capture.id, outputs, verified);
    const stabilized = await stabilizer.stabilize(stabilizationRequest);
    const stabilizedByRef = new Map(stabilized.assertions.map((assertion) => [assertion.ref, assertion]));

    const stats = await db.$transaction(
      async (tx) => {
        const evidenceIds = new Map<string, string>();
        const conversationIds = new Map<string, string>();

        for (const conversation of reconstruction.conversations) {
          const row = await tx.conversation.create({
            data: {
              captureId: capture.id,
              label: conversation.label,
              basis: JSON.stringify(conversation.basis),
              startedAt: conversation.startedAt,
              endedAt: conversation.endedAt,
              messageCount: conversation.messageIds.length,
            },
          });
          conversationIds.set(conversation.key, row.id);
        }

        for (const message of reconstruction.messages) {
          const origin = grantByMessage.get(message.externalId)!;
          const evidence = await tx.evidence.upsert({
            where: { grantId_externalId: { grantId: origin.grantId, externalId: message.externalId } },
            update: {},
            create: {
              provider: origin.provider,
              externalId: message.externalId,
              threadKey: message.threadKey,
              container: message.container,
              authorIdentityKey: identityKeyFor(message.author),
              authorDisplay: message.author.displayName,
              recipients: JSON.stringify(message.recipients.map(identityKeyFor)),
              subject: message.subject,
              communicatedAt: message.communicatedAt,
              permalink: message.permalink,
              excerpt: message.excerpt,
              contentHash: message.contentHash,
              envelope: serializeEnvelope(message.envelope),
              sourceAcl: JSON.stringify(message.sourceAcl),
              organizationId: principal.organizationId,
              grantId: origin.grantId,
            },
          });
          evidenceIds.set(message.externalId, evidence.id);
          for (const identity of [message.author, ...message.recipients]) {
            await resolveSourceIdentity(tx, principal.organizationId, identity, message.envelope);
          }
        }

        for (const message of reconstruction.messages) {
          await tx.captureEvidence.create({
            data: {
              captureId: capture.id,
              evidenceId: evidenceIds.get(message.externalId)!,
              conversationId: conversationIds.get(message.conversationKey) ?? null,
              duplicateOfEvidenceId: message.duplicateOf ? (evidenceIds.get(message.duplicateOf) ?? null) : null,
              referencesEvidenceIds: JSON.stringify(
                message.references.map((id) => evidenceIds.get(id)).filter((id): id is string => Boolean(id)),
              ),
            },
          });
        }

        const materializer = entityMaterializer(tx, principal, capture.id, stabilizationRequest, stabilized);
        const cited = new Set<string>();
        const buckets: Record<string, number> = {};
        for (const [index, item] of verified.entries()) {
          const ref = assertionRef(index);
          const result = stabilizedByRef.get(ref);
          if (!result) throw new StabilizationUnavailableError(`Stabilization returned no result for ${ref}.`);
          const assertion = item.source;
          const original = stabilizationRequest.extracted.assertions[index];
          const subjectEntityId = result.canonical.subject ? await materializer.resolveTarget(result.canonical.subject, item.envelope) : null;
          const objectEntityId = result.canonical.object ? await materializer.resolveTarget(result.canonical.object, item.envelope) : null;
          const effectiveFrom = parseDay(assertion.effectiveFrom);
          const effectiveTo = parseDay(assertion.effectiveTo);
          const hasTime = Boolean(effectiveFrom || effectiveTo);
          const kind = assertion.kind as AssertionKind;
          const bucket = bucketForKind(kind);
          buckets[bucket] = (buckets[bucket] ?? 0) + 1;

          await tx.assertion.create({
            data: {
              kind,
              bucket,
              statement: assertion.statement.trim(),
              predicate: result.canonical.predicate_key,
              predicateLabel: result.canonical.predicate_label,
              rawPredicate: assertion.predicate,
              stabilization: JSON.stringify({
                contract: stabilized.contract,
                sameVersion: stabilized.same_version,
                registryVersion: stabilized.registry_version,
                uncertainty: result.uncertainty,
                nonAssertive: result.non_assertive,
                transforms: result.transforms,
                flags: result.flags,
                notes: result.notes,
                comparisons: result.comparisons,
                subject: materializer.describe(original.subject_ref),
                object: materializer.describe(original.object_ref),
              }),
              holderCardinality: result.canonical.holder_cardinality ?? assertion.holderCardinality,
              operationalStatus: assertion.operationalStatus,
              modality: assertion.modality,
              confidence: Math.min(1, Math.max(0, assertion.confidence)),
              effectiveFrom,
              effectiveTo,
              timeBasis: hasTime ? assertion.timeBasis : TIME_BASIS.UNKNOWN,
              timeExpression: assertion.timeExpression,
              firstCommunicatedAt: item.firstCommunicatedAt,
              lastCommunicatedAt: item.lastCommunicatedAt,
              supersedesFactIds: JSON.stringify(assertion.supersedesFactIds.filter((id) => visibleFactIds.has(id))),
              rationale: assertion.rationale,
              extractorVersion: extraction.version,
              extractorModel: model.id,
              envelope: serializeEnvelope(item.envelope),
              organizationId: principal.organizationId,
              ownerId: principal.userId,
              captureId: capture.id,
              subjectEntityId,
              objectEntityId,
              evidence: {
                create: item.evidence.map((evidence) => ({
                  role: evidence.role,
                  quote: evidence.quote,
                  quoteStart: evidence.start,
                  quoteEnd: evidence.end,
                  evidenceId: evidenceIds.get(evidence.messageId)!,
                })),
              },
            },
          });
          for (const evidence of item.evidence) cited.add(evidence.messageId);
        }

        await tx.captureEvidence.updateMany({
          where: { captureId: capture.id, evidenceId: { in: [...cited].map((id) => evidenceIds.get(id)!) } },
          data: { cited: true },
        });

        const duplicates = reconstruction.messages.filter((message) => message.duplicateOf).length;
        const byProvider: Record<string, number> = {};
        for (const message of collected) byProvider[message.provider] = (byProvider[message.provider] ?? 0) + 1;
        const result: CaptureStats = {
          messagesRead: collected.length,
          byProvider,
          conversations: reconstruction.conversations.length,
          duplicates,
          cited: cited.size,
          setAside: reconstruction.messages.filter((m) => !cited.has(m.externalId) && !m.duplicateOf).length,
          proposed: verified.length,
          rejected,
          buckets,
          stabilization: {
            contract: stabilized.contract,
            sameVersion: stabilized.same_version,
            registryVersion: stabilized.registry_version,
            stabilizer: stabilizer.id,
            entityResolutions: stabilized.diagnostics.entity_resolutions,
            flags: stabilized.diagnostics.flags,
          },
          pork: { capability: CONTEXT_CAPTURE_CAPABILITY, version: extraction.version },
        };

        assertCaptureTransition(status, CAPTURE_STATUS.READY_FOR_REVIEW);
        await tx.capture.update({
          where: { id: capture.id },
          data: {
            status: CAPTURE_STATUS.READY_FOR_REVIEW,
            extractorVersion: extraction.version,
            extractorModel: model.id,
            stats: JSON.stringify(result),
          },
        });
        await audit(tx, principal, "CAPTURE_READY_FOR_REVIEW", "CAPTURE", capture.id, {
          messagesRead: result.messagesRead,
          proposed: result.proposed,
          rejected: result.rejected.length,
          model: model.id,
          porkVersion: extraction.version,
          sameVersion: stabilized.same_version,
        });
        return result;
      },
      { timeout: 120_000, maxWait: 10_000 },
    );
    status = CAPTURE_STATUS.READY_FOR_REVIEW;
    return { captureId: capture.id, stats };
  } catch (error) {
    const reason =
      error instanceof CaptureInputError || error instanceof ScopeRefusedError
        ? error.message
        : error instanceof StabilizationUnavailableError
          ? "Semantic stabilization was unavailable, so nothing was stored."
          : "The capture could not be completed.";
    await db.capture.update({ where: { id: capture.id }, data: { status: CAPTURE_STATUS.FAILED, failureReason: reason } });
    await audit(db, principal, "CAPTURE_FAILED", "CAPTURE", capture.id, {
      stage: status,
      errorType: error instanceof Error ? error.name : "unknown",
    });
    throw error;
  }
}
