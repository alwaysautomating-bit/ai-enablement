import type { Db, DbClient } from "../db";
import { audit } from "./audit";
import { envelopeAllows, parseEnvelope, sharedItemAllows } from "./envelope";
import { EDGE_KINDS, type AssertionKind, type Principal, type ReviewDecisionType, type Sharing } from "./types";

// Review is the only path from candidate context to operational fact. Facts are
// immutable. Changes over time are recorded by closing validity windows on earlier
// relationships, never by editing or deleting them.

export type ReviewCorrection = {
  statement?: string;
  predicate?: string | null;
  subjectEntityId?: string | null;
  objectEntityId?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  operationalStatus?: string;
};

export type ReviewInput = {
  decision: ReviewDecisionType;
  visibility: Sharing;
  correction?: ReviewCorrection;
  note?: string;
};

export class ReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewError";
  }
}

function day(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new ReviewError("Dates must be YYYY-MM-DD.");
  return new Date(`${value}T00:00:00.000Z`);
}

function orderKey(relationship: { validFrom: Date | null; firstCommunicatedAt: Date }) {
  return (relationship.validFrom ?? relationship.firstCommunicatedAt).getTime();
}

/**
 * Re-derive validity windows for a one-holder relationship (only one subject can hold
 * `predicate` for `toEntityId` at a time). Each holder's window closes when the next
 * holder's begins. Windows are only ever shortened, never extended, and relationships
 * are never deleted. Only the reviewer's own relationships participate, so one person's
 * private facts never rewrite someone else's history.
 */
async function reflowOneHolderTimeline(
  db: DbClient,
  principal: Principal,
  toEntityId: string,
  predicate: string,
) {
  const relationships = await db.relationship.findMany({
    where: {
      organizationId: principal.organizationId,
      ownerId: principal.userId,
      toEntityId,
      predicate,
      holderCardinality: "ONE",
      status: "ACTIVE",
    },
  });
  relationships.sort((a, b) => orderKey(a) - orderKey(b));
  for (let index = 0; index < relationships.length - 1; index += 1) {
    const current = relationships[index];
    const next = relationships.slice(index + 1).find((candidate) => candidate.fromEntityId !== current.fromEntityId);
    if (!next) continue;
    const nextStart = new Date(orderKey(next));
    if (current.validTo && current.validTo <= nextStart) continue;
    await db.relationship.update({
      where: { id: current.id },
      data: { validTo: nextStart, closedByRelationshipId: next.id },
    });
    await audit(db, principal, "RELATIONSHIP_WINDOW_CLOSED", "RELATIONSHIP", current.id, { closedBy: next.id });
  }
}

export async function reviewAssertion(db: Db, principal: Principal, assertionId: string, input: ReviewInput) {
  const assertion = await db.assertion.findUnique({ where: { id: assertionId } });
  if (!assertion || assertion.organizationId !== principal.organizationId) throw new ReviewError("Item not found.");
  // In this release the person who ran the capture reviews its candidates.
  if (assertion.ownerId !== principal.userId) throw new ReviewError("Only the person who ran this capture can review it.");
  if (!envelopeAllows(parseEnvelope(assertion.envelope), principal)) throw new ReviewError("Item not found.");
  if (assertion.status !== "NEEDS_REVIEW") throw new ReviewError("This item has already been reviewed.");

  return db.$transaction(async (tx) => {
    await tx.reviewDecision.create({
      data: {
        assertionId,
        reviewerId: principal.userId,
        decision: input.decision,
        correction: input.correction ? JSON.stringify(input.correction) : null,
        visibility: input.decision === "NOT_USEFUL" ? "OWNER" : input.visibility,
        note: input.note ?? null,
      },
    });

    if (input.decision === "NOT_USEFUL") {
      await tx.assertion.update({ where: { id: assertionId }, data: { status: "NOT_USEFUL" } });
      await audit(tx, principal, "CONTEXT_NOT_USEFUL", "ASSERTION", assertionId);
      return { assertionId, factId: null, relationshipId: null };
    }

    const correction = input.decision === "CORRECT" ? (input.correction ?? {}) : {};
    if (input.decision === "CORRECT" && Object.keys(correction).length === 0) {
      throw new ReviewError("Describe the correction.");
    }
    for (const entityId of [correction.subjectEntityId, correction.objectEntityId]) {
      if (!entityId) continue;
      const entity = await tx.opEntity.findUnique({ where: { id: entityId } });
      if (!entity || entity.organizationId !== principal.organizationId || !envelopeAllows(parseEnvelope(entity.envelope), principal)) {
        throw new ReviewError("That entity is not available.");
      }
    }

    const correctedFrom = day(correction.effectiveFrom);
    const correctedTo = day(correction.effectiveTo);
    const timeCorrected = correctedFrom !== undefined || correctedTo !== undefined;
    const fact = {
      kind: assertion.kind,
      statement: correction.statement?.trim() || assertion.statement,
      predicate: correction.predicate !== undefined ? correction.predicate : assertion.predicate,
      subjectEntityId: correction.subjectEntityId !== undefined ? correction.subjectEntityId : assertion.subjectEntityId,
      objectEntityId: correction.objectEntityId !== undefined ? correction.objectEntityId : assertion.objectEntityId,
      effectiveFrom: correctedFrom !== undefined ? correctedFrom : assertion.effectiveFrom,
      effectiveTo: correctedTo !== undefined ? correctedTo : assertion.effectiveTo,
      timeBasis: timeCorrected ? "STATED_BY_REVIEWER" : assertion.timeBasis,
      operationalStatus: correction.operationalStatus ?? assertion.operationalStatus,
    };

    const created = await tx.operationalFact.create({
      data: {
        kind: fact.kind,
        statement: fact.statement,
        predicate: fact.predicate,
        predicateLabel: fact.predicate === assertion.predicate ? assertion.predicateLabel : fact.predicate,
        subjectEntityId: fact.subjectEntityId,
        objectEntityId: fact.objectEntityId,
        effectiveFrom: fact.effectiveFrom,
        effectiveTo: fact.effectiveTo,
        timeBasis: fact.timeBasis,
        firstCommunicatedAt: assertion.firstCommunicatedAt,
        envelope: assertion.envelope,
        sharing: input.visibility,
        organizationId: principal.organizationId,
        ownerId: principal.userId,
        establishedById: principal.userId,
        assertionId,
      },
    });
    await tx.assertion.update({
      where: { id: assertionId },
      data: { status: input.decision === "CORRECT" ? "CORRECTED" : "CONFIRMED" },
    });
    const entityIds = [fact.subjectEntityId, fact.objectEntityId].filter((id): id is string => Boolean(id));
    await tx.opEntity.updateMany({ where: { id: { in: entityIds }, status: "CANDIDATE" }, data: { status: "CONFIRMED" } });
    await audit(tx, principal, input.decision === "CORRECT" ? "CONTEXT_CORRECTED" : "CONTEXT_CONFIRMED", "OPERATIONAL_FACT", created.id, {
      assertionId,
      sharing: input.visibility,
    });

    // Explicit supersession of earlier facts this person can see.
    const supersedes = (JSON.parse(assertion.supersedesFactIds) as string[]).filter(Boolean);
    for (const factId of supersedes) {
      const earlier = await tx.operationalFact.findUnique({ where: { id: factId }, include: { relationships: true } });
      if (!earlier || !sharedItemAllows(earlier, principal) || earlier.status !== "ACTIVE") continue;
      await tx.operationalFact.update({ where: { id: factId }, data: { status: "SUPERSEDED", supersededById: created.id } });
      await audit(tx, principal, "FACT_SUPERSEDED", "OPERATIONAL_FACT", factId, { supersededBy: created.id });
    }

    let relationshipId: string | null = null;
    const isEdge = EDGE_KINDS.includes(fact.kind as AssertionKind) && fact.subjectEntityId && fact.objectEntityId && fact.predicate;
    if (isEdge && ["ACTIVE", "ENDED"].includes(fact.operationalStatus)) {
      const open = await tx.relationship.findFirst({
        where: {
          organizationId: principal.organizationId,
          ownerId: principal.userId,
          fromEntityId: fact.subjectEntityId!,
          toEntityId: fact.objectEntityId!,
          predicate: fact.predicate!,
          status: "ACTIVE",
          validTo: null,
        },
      });

      if (open && fact.operationalStatus === "ENDED") {
        // A statement that something stopped closes the open window.
        await tx.relationship.update({
          where: { id: open.id },
          data: {
            validTo: fact.effectiveTo ?? fact.effectiveFrom ?? assertion.firstCommunicatedAt,
            corroboratingFactIds: JSON.stringify([...JSON.parse(open.corroboratingFactIds), created.id]),
          },
        });
        relationshipId = open.id;
        await audit(tx, principal, "RELATIONSHIP_WINDOW_CLOSED", "RELATIONSHIP", open.id, { byFact: created.id });
      } else if (open) {
        // The same relationship stated again corroborates it; it does not create a copy.
        const earlierStart =
          fact.effectiveFrom && (!open.validFrom || fact.effectiveFrom < open.validFrom) ? fact.effectiveFrom : open.validFrom;
        await tx.relationship.update({
          where: { id: open.id },
          data: {
            validFrom: earlierStart,
            corroboratingFactIds: JSON.stringify([...JSON.parse(open.corroboratingFactIds), created.id]),
          },
        });
        relationshipId = open.id;
        await audit(tx, principal, "RELATIONSHIP_CORROBORATED", "RELATIONSHIP", open.id, { byFact: created.id });
      } else {
        // A relationship already over when confirmed is still history worth keeping.
        // One-holder windows are closed by the reflow below; otherwise, without a stated
        // end, the last time it was mentioned is the best bound available.
        const endedWithoutDate = fact.operationalStatus === "ENDED" && !fact.effectiveTo;
        const validTo =
          endedWithoutDate && assertion.holderCardinality !== "ONE" ? assertion.lastCommunicatedAt : fact.effectiveTo;
        const relationship = await tx.relationship.create({
          data: {
            predicate: fact.predicate!,
            predicateLabel: fact.predicate === assertion.predicate ? assertion.predicateLabel : fact.predicate,
            holderCardinality: assertion.holderCardinality === "ONE" ? "ONE" : "MANY",
            validFrom: fact.effectiveFrom,
            validTo,
            timeBasis: fact.timeBasis,
            firstCommunicatedAt: assertion.firstCommunicatedAt,
            envelope: assertion.envelope,
            sharing: input.visibility,
            organizationId: principal.organizationId,
            ownerId: principal.userId,
            fromEntityId: fact.subjectEntityId!,
            toEntityId: fact.objectEntityId!,
            factId: created.id,
          },
        });
        relationshipId = relationship.id;
        await audit(tx, principal, "RELATIONSHIP_CREATED", "RELATIONSHIP", relationship.id, { factId: created.id });
      }

      if (assertion.holderCardinality === "ONE") {
        await reflowOneHolderTimeline(tx, principal, fact.objectEntityId!, fact.predicate!);
      }
    }

    return { assertionId, factId: created.id, relationshipId };
  });
}
