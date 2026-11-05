import type { DbClient as Db } from "../db";
import { parseEnvelope, serializeEnvelope } from "./envelope";
import type { AccessEnvelope, SourceIdentityRef } from "./types";

// Source-identity resolution and entity bookkeeping. Deterministic identifiers (the same email
// across email and chat) link people. All other identity, alias, and entity-vs-activity
// decisions come from SAME semantic stabilization (see stabilizer.ts); nothing here matches
// entities by name. normalizeName is used only to key stored aliases and lookups by name.

const CORPORATE_SUFFIXES = /\b(inc|incorporated|llc|ltd|limited|co|company|corp|corporation|plc|gmbh)\b\.?/g;

export function normalizeName(name: string) {
  return name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[’']s\b/g, "")
    .replace(CORPORATE_SUFFIXES, "")
    .replace(/[^a-z0-9@.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function identityKeyFor(identity: SourceIdentityRef) {
  return identity.email ? `email:${identity.email.toLowerCase()}` : `${identity.provider}:${identity.externalId}`;
}

/** Ensure a person entity exists for a source identity, linked by identity key. */
export async function resolveSourceIdentity(
  db: Db,
  organizationId: string,
  identity: SourceIdentityRef,
  envelope: AccessEnvelope,
) {
  const identityKey = identityKeyFor(identity);
  const existing = await db.sourceIdentity.findUnique({
    where: {
      organizationId_provider_externalId: {
        organizationId,
        provider: identity.provider,
        externalId: identity.externalId,
      },
    },
  });

  // Another provider may already have produced an entity for the same person.
  const sibling = await db.sourceIdentity.findFirst({
    where: { organizationId, identityKey, entityId: { not: null } },
  });
  let entityId = existing?.entityId ?? sibling?.entityId ?? null;

  if (!entityId) {
    const entity = await db.opEntity.create({
      data: {
        organizationId,
        entityType: "PERSON",
        canonicalName: identity.displayName,
        // A person named by a source identifier is established by the identifier itself.
        status: "CONFIRMED",
        envelope: serializeEnvelope(envelope),
      },
    });
    entityId = entity.id;
  } else {
    await widenEntityEnvelope(db, entityId, envelope);
  }
  await addAlias(db, entityId, identity.displayName, "SOURCE_IDENTITY");

  if (!existing) {
    await db.sourceIdentity.create({
      data: {
        organizationId,
        provider: identity.provider,
        externalId: identity.externalId,
        identityKey,
        email: identity.email,
        displayName: identity.displayName,
        entityId,
      },
    });
  } else if (!existing.entityId) {
    await db.sourceIdentity.update({ where: { id: existing.id }, data: { entityId } });
  }
  return entityId;
}

/**
 * An entity's existence is visible to anyone who could see a message naming it, so an
 * entity envelope is the union of the envelopes where it appeared. Facts about it are
 * governed separately by their own intersected envelopes.
 */
export async function widenEntityEnvelope(db: Db, entityId: string, envelope: AccessEnvelope) {
  const entity = await db.opEntity.findUniqueOrThrow({ where: { id: entityId } });
  const current = parseEnvelope(entity.envelope);
  const union = { principals: [...new Set([...current.principals, ...envelope.principals])] };
  await db.opEntity.update({ where: { id: entityId }, data: { envelope: serializeEnvelope(union) } });
}

export async function addAlias(db: Db, entityId: string, alias: string, basis: string) {
  const normalized = normalizeName(alias);
  if (!normalized) return;
  await db.entityAlias.upsert({
    where: { entityId_normalized: { entityId, normalized } },
    update: {},
    create: { entityId, alias, normalized, basis },
  });
}
