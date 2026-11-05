import type { Db } from "../db";
import { normalizeName } from "./entities";
import { describeEnvelope, envelopeAllows, parseEnvelope, sharedItemAllows } from "./envelope";
import type { Principal } from "./types";

// Permission-aware projections: the single read path for the web UI, the MCP server,
// and AI clients. Filtering happens here, before anything reaches a model or a client.
// Items a person may not see are omitted entirely rather than redacted, so their
// existence is not disclosed.

type EvidenceRow = {
  id: string;
  externalId: string;
  provider: string;
  container: string;
  authorDisplay: string;
  subject: string | null;
  communicatedAt: Date;
  permalink: string | null;
  excerpt: string;
  envelope: string;
  sourceAcl: string;
};

export type EvidencePointer = {
  evidenceId: string;
  sourceMessageId: string;
  where: string;
  author: string;
  communicatedAt: string;
  permalink: string | null;
  quote: string;
  role: string;
};

function pointer(evidence: EvidenceRow, quote: string, role: string): EvidencePointer {
  return {
    evidenceId: evidence.id,
    sourceMessageId: evidence.externalId,
    where: evidence.subject ? `${evidence.container} · "${evidence.subject}"` : evidence.container,
    author: evidence.authorDisplay,
    communicatedAt: evidence.communicatedAt.toISOString(),
    permalink: evidence.permalink,
    quote,
    role,
  };
}

function iso(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function tokens(query: string) {
  return normalizeName(query)
    .split(" ")
    .filter((token) => token.length >= 3);
}

export async function listCaptures(db: Db, principal: Principal) {
  const captures = await db.capture.findMany({
    where: { organizationId: principal.organizationId, createdById: principal.userId },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { _count: { select: { assertions: true } } },
  });
  return captures.map((capture) => ({
    id: capture.id,
    question: capture.question,
    status: capture.status,
    createdAt: capture.createdAt.toISOString(),
    items: capture._count.assertions,
    failureReason: capture.failureReason,
  }));
}

/** The full review view of one capture. Only its owner may open it. */
export async function getCaptureView(db: Db, principal: Principal, captureId: string) {
  const capture = await db.capture.findUnique({
    where: { id: captureId },
    include: {
      scopes: { include: { grant: { select: { provider: true, accountLabel: true } } } },
      conversations: { orderBy: { startedAt: "asc" }, include: { evidence: { include: { evidence: true } } } },
      evidence: { include: { evidence: true } },
      assertions: {
        orderBy: [{ bucket: "asc" }, { firstCommunicatedAt: "asc" }],
        include: {
          evidence: { include: { evidence: true } },
          subjectEntity: { select: { id: true, canonicalName: true, entityType: true, status: true } },
          objectEntity: { select: { id: true, canonicalName: true, entityType: true, status: true } },
          decisions: { orderBy: { decidedAt: "desc" }, take: 1 },
          fact: { select: { id: true, sharing: true, status: true } },
        },
      },
    },
  });
  if (!capture || capture.organizationId !== principal.organizationId || capture.createdById !== principal.userId) {
    return null;
  }

  const assertions = capture.assertions.filter((assertion) => envelopeAllows(parseEnvelope(assertion.envelope), principal));
  const entityIds = new Set(
    assertions.flatMap((a) => [a.subjectEntity?.id, a.objectEntity?.id]).filter((id): id is string => Boolean(id)),
  );
  const entities = await db.opEntity.findMany({
    where: { id: { in: [...entityIds] } },
    include: { aliases: true },
  });
  const stats = JSON.parse(capture.stats) as Record<string, unknown>;

  return {
    id: capture.id,
    question: capture.question,
    status: capture.status,
    failureReason: capture.failureReason,
    createdAt: capture.createdAt.toISOString(),
    window: { start: iso(capture.windowStart), end: iso(capture.windowEnd) },
    extractor: { version: capture.extractorVersion, model: capture.extractorModel },
    scopes: capture.scopes.map((scope) => ({ source: scope.grant.accountLabel, label: scope.label })),
    stats,
    summary: {
      people: entities.filter((entity) => entity.entityType === "PERSON").length,
      otherEntities: entities.filter((entity) => entity.entityType !== "PERSON").length,
      responsibilityChanges: assertions.filter(
        (a) => a.kind === "RESPONSIBILITY" && (a.holderCardinality === "ONE" || a.operationalStatus === "ENDED"),
      ).length,
      byBucket: assertions.reduce<Record<string, number>>((counts, a) => {
        counts[a.bucket] = (counts[a.bucket] ?? 0) + 1;
        return counts;
      }, {}),
      needsReview: assertions.filter((a) => a.status === "NEEDS_REVIEW").length,
    },
    entities: entities.map((entity) => ({
      id: entity.id,
      name: entity.canonicalName,
      type: entity.entityType,
      status: entity.status,
      aliases: entity.aliases.map((alias) => alias.alias).filter((alias) => alias !== entity.canonicalName),
    })),
    conversations: capture.conversations.map((conversation) => ({
      id: conversation.id,
      label: conversation.label,
      basis: JSON.parse(conversation.basis) as string[],
      startedAt: conversation.startedAt.toISOString(),
      endedAt: conversation.endedAt.toISOString(),
      messages: conversation.evidence
        .map((link) => ({
          evidenceId: link.evidence.id,
          sourceMessageId: link.evidence.externalId,
          where: link.evidence.container,
          author: link.evidence.authorDisplay,
          communicatedAt: link.evidence.communicatedAt.toISOString(),
          cited: link.cited,
          duplicate: Boolean(link.duplicateOfEvidenceId),
        }))
        .sort((a, b) => a.communicatedAt.localeCompare(b.communicatedAt)),
    })),
    assertions: assertions.map((assertion) => ({
      id: assertion.id,
      kind: assertion.kind,
      bucket: assertion.bucket,
      statement: assertion.statement,
      subject: assertion.subjectEntity,
      predicate: assertion.predicate,
      predicateLabel: assertion.predicateLabel,
      rawPredicate: assertion.rawPredicate,
      stabilization: JSON.parse(assertion.stabilization) as Record<string, unknown>,
      object: assertion.objectEntity,
      holderCardinality: assertion.holderCardinality,
      operationalStatus: assertion.operationalStatus,
      modality: assertion.modality,
      confidence: assertion.confidence,
      operationalTime: {
        from: iso(assertion.effectiveFrom),
        to: iso(assertion.effectiveTo),
        basis: assertion.timeBasis,
        expression: assertion.timeExpression,
      },
      communicated: {
        first: assertion.firstCommunicatedAt.toISOString(),
        last: assertion.lastCommunicatedAt.toISOString(),
      },
      rationale: assertion.rationale,
      audience: describeEnvelope(parseEnvelope(assertion.envelope)),
      reviewState: assertion.status,
      decision: assertion.decisions[0]
        ? { decision: assertion.decisions[0].decision, visibility: assertion.decisions[0].visibility }
        : null,
      factId: assertion.fact?.id ?? null,
      evidence: assertion.evidence.map((link) => ({
        ...pointer(link.evidence, link.quote, link.role),
        excerpt: link.evidence.excerpt,
        quoteStart: link.quoteStart,
        quoteEnd: link.quoteEnd,
        access: (JSON.parse(link.evidence.sourceAcl) as { description: string }).description,
      })),
    })),
  };
}

async function visibleFacts(db: Db, principal: Principal) {
  const facts = await db.operationalFact.findMany({
    where: { organizationId: principal.organizationId, status: { in: ["ACTIVE", "SUPERSEDED"] } },
    include: {
      assertion: { include: { evidence: { include: { evidence: true } } } },
      relationships: true,
    },
  });
  return facts.filter((fact) => sharedItemAllows(fact, principal));
}

async function entityNames(db: Db, ids: string[]) {
  const entities = await db.opEntity.findMany({ where: { id: { in: ids } }, include: { aliases: true } });
  return new Map(entities.map((entity) => [entity.id, entity]));
}

/**
 * Search reviewed operational context. Unreviewed candidates are returned only when
 * requested, only to their owner, and always labelled as candidates.
 */
export async function searchContext(
  db: Db,
  principal: Principal,
  query: string,
  options: { includeCandidates?: boolean; limit?: number } = {},
) {
  const wanted = tokens(query);
  const facts = await visibleFacts(db, principal);
  const names = await entityNames(
    db,
    facts.flatMap((fact) => [fact.subjectEntityId, fact.objectEntityId]).filter((id): id is string => Boolean(id)),
  );

  const describeEntity = (id: string | null) => {
    if (!id) return null;
    const entity = names.get(id);
    return entity ? { id, name: entity.canonicalName, type: entity.entityType } : null;
  };
  const searchable = (id: string | null) => {
    const entity = id ? names.get(id) : null;
    return entity ? [entity.canonicalName, ...entity.aliases.map((alias) => alias.alias)].join(" ") : "";
  };
  const score = (text: string) => {
    const haystack = normalizeName(text);
    return wanted.length === 0 ? 1 : wanted.filter((token) => haystack.includes(token)).length;
  };

  const confirmed = facts
    .map((fact) => ({
      fact,
      score: score(`${fact.statement} ${fact.predicate ?? ""} ${searchable(fact.subjectEntityId)} ${searchable(fact.objectEntityId)}`),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (b.fact.effectiveFrom?.getTime() ?? 0) - (a.fact.effectiveFrom?.getTime() ?? 0))
    .slice(0, options.limit ?? 20)
    .map(({ fact }) => ({
      status: fact.status === "SUPERSEDED" ? "CONFIRMED_BUT_SUPERSEDED" : "CONFIRMED",
      factId: fact.id,
      kind: fact.kind,
      statement: fact.statement,
      subject: describeEntity(fact.subjectEntityId),
      predicate: fact.predicate,
      predicateLabel: fact.predicateLabel,
      object: describeEntity(fact.objectEntityId),
      operationalTime: { from: iso(fact.effectiveFrom), to: iso(fact.effectiveTo), basis: fact.timeBasis },
      firstCommunicatedAt: fact.firstCommunicatedAt.toISOString(),
      establishedAt: fact.establishedAt.toISOString(),
      relationships: fact.relationships
        .filter((relationship) => sharedItemAllows(relationship, principal))
        .map((relationship) => ({
          relationshipId: relationship.id,
          validFrom: iso(relationship.validFrom),
          validTo: iso(relationship.validTo),
          current: !relationship.validTo || relationship.validTo > new Date(),
        })),
      provenance: fact.assertion.evidence
        .filter((link) => envelopeAllows(parseEnvelope(link.evidence.envelope), principal))
        .map((link) => pointer(link.evidence, link.quote, link.role)),
      reviewedBy: fact.establishedById === principal.userId ? "you" : "a colleague",
    }));

  let candidates: Array<Record<string, unknown>> = [];
  if (options.includeCandidates) {
    const pending = await db.assertion.findMany({
      where: { organizationId: principal.organizationId, ownerId: principal.userId, status: "NEEDS_REVIEW" },
      include: {
        evidence: { include: { evidence: true } },
        subjectEntity: { include: { aliases: true } },
        objectEntity: { include: { aliases: true } },
      },
    });
    candidates = pending
      .filter((assertion) => envelopeAllows(parseEnvelope(assertion.envelope), principal))
      .map((assertion) => ({
        assertion,
        score: score(
          [
            assertion.statement,
            assertion.subjectEntity?.canonicalName,
            ...(assertion.subjectEntity?.aliases.map((a) => a.alias) ?? []),
            assertion.objectEntity?.canonicalName,
            ...(assertion.objectEntity?.aliases.map((a) => a.alias) ?? []),
          ].join(" "),
        ),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, options.limit ?? 20)
      .map(({ assertion }) => ({
        status: "UNREVIEWED_CANDIDATE",
        warning: "Not confirmed by a person. Do not treat as fact.",
        assertionId: assertion.id,
        kind: assertion.kind,
        statement: assertion.statement,
        modality: assertion.modality,
        confidence: assertion.confidence,
        operationalTime: { from: iso(assertion.effectiveFrom), to: iso(assertion.effectiveTo), basis: assertion.timeBasis },
        provenance: assertion.evidence.map((link) => pointer(link.evidence, link.quote, link.role)),
      }));
  }

  return { query, confirmed, candidates };
}

/** One entity's relationships over time, with operational and communication chronology. */
export async function getEntityTimeline(db: Db, principal: Principal, entityRef: string) {
  let entity = await db.opEntity.findUnique({ where: { id: entityRef }, include: { aliases: true } });
  if (!entity) {
    const normalized = normalizeName(entityRef);
    const candidates = await db.opEntity.findMany({
      where: {
        organizationId: principal.organizationId,
        status: { in: ["CONFIRMED", "CANDIDATE"] },
        aliases: { some: { normalized } },
      },
      include: { aliases: true },
    });
    entity =
      candidates.find((candidate) => candidate.status === "CONFIRMED" && envelopeAllows(parseEnvelope(candidate.envelope), principal)) ??
      candidates.find((candidate) => envelopeAllows(parseEnvelope(candidate.envelope), principal)) ??
      null;
  }
  if (!entity || entity.organizationId !== principal.organizationId || !envelopeAllows(parseEnvelope(entity.envelope), principal)) {
    return null;
  }

  const relationships = await db.relationship.findMany({
    where: { organizationId: principal.organizationId, OR: [{ fromEntityId: entity.id }, { toEntityId: entity.id }] },
    include: {
      fromEntity: { select: { id: true, canonicalName: true } },
      toEntity: { select: { id: true, canonicalName: true } },
      fact: { include: { assertion: { include: { evidence: { include: { evidence: true } } } } } },
    },
  });
  const visible = relationships.filter((relationship) => sharedItemAllows(relationship, principal));
  const visibleIds = new Set(visible.map((relationship) => relationship.id));
  visible.sort(
    (a, b) =>
      (a.validFrom ?? a.firstCommunicatedAt).getTime() - (b.validFrom ?? b.firstCommunicatedAt).getTime(),
  );

  return {
    entity: {
      id: entity.id,
      name: entity.canonicalName,
      type: entity.entityType,
      status: entity.status,
      aliases: entity.aliases.map((alias) => alias.alias).filter((alias) => alias !== entity!.canonicalName),
    },
    timeline: visible.map((relationship) => ({
      relationshipId: relationship.id,
      from: relationship.fromEntity,
      predicate: relationship.predicate,
      predicateLabel: relationship.predicateLabel,
      to: relationship.toEntity,
      oneHolderAtATime: relationship.holderCardinality === "ONE",
      operationalTime: {
        validFrom: iso(relationship.validFrom),
        validTo: iso(relationship.validTo),
        basis: relationship.timeBasis,
        startKnown: Boolean(relationship.validFrom),
      },
      firstCommunicatedAt: relationship.firstCommunicatedAt.toISOString(),
      current: !relationship.validTo || relationship.validTo > new Date(),
      // Disclose what closed a window only if the viewer may see that relationship too.
      closedBy: relationship.closedByRelationshipId && visibleIds.has(relationship.closedByRelationshipId)
        ? relationship.closedByRelationshipId
        : relationship.closedByRelationshipId
          ? "a later change you do not have access to"
          : null,
      statement: relationship.fact.statement,
      provenance: relationship.fact.assertion.evidence
        .filter((link) => envelopeAllows(parseEnvelope(link.evidence.envelope), principal))
        .map((link) => pointer(link.evidence, link.quote, link.role)),
    })),
  };
}

/** Read one piece of evidence. Allowed only through a capture the person ran or a fact they can see. */
export async function getEvidence(db: Db, principal: Principal, evidenceId: string) {
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: {
      captures: { include: { capture: { select: { createdById: true } } } },
      assertions: { include: { assertion: { include: { fact: true } } } },
    },
  });
  if (!evidence || evidence.organizationId !== principal.organizationId) return null;
  if (!envelopeAllows(parseEnvelope(evidence.envelope), principal)) return null;
  const viaCapture = evidence.captures.some((link) => link.capture.createdById === principal.userId);
  const viaFact = evidence.assertions.some((link) => link.assertion.fact && sharedItemAllows(link.assertion.fact, principal));
  if (!viaCapture && !viaFact) return null;
  return {
    evidenceId: evidence.id,
    sourceMessageId: evidence.externalId,
    where: evidence.container,
    subject: evidence.subject,
    author: evidence.authorDisplay,
    communicatedAt: evidence.communicatedAt.toISOString(),
    retrievedAt: evidence.retrievedAt.toISOString(),
    permalink: evidence.permalink,
    text: evidence.excerpt,
    access: (JSON.parse(evidence.sourceAcl) as { description: string }).description,
  };
}
