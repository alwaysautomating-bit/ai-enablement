import type { AccessEnvelope, Principal, Sharing } from "./types";

// Access envelopes travel with every piece of evidence-derived information.
// Derived information never escapes the permissions of its inputs: the envelope of
// anything built from several sources is the intersection of theirs.

export function orgPrincipal(organizationId: string) {
  return `org:${organizationId}`;
}

export function emailPrincipal(email: string) {
  return `email:${email.trim().toLowerCase()}`;
}

export function normalizeEnvelope(envelope: AccessEnvelope): AccessEnvelope {
  return { principals: [...new Set(envelope.principals)].sort() };
}

function orgOf(envelope: AccessEnvelope) {
  return envelope.principals.filter((p) => p.startsWith("org:"));
}

function peopleOf(envelope: AccessEnvelope) {
  return envelope.principals.filter((p) => p.startsWith("email:"));
}

/**
 * Intersect two envelopes. An organization-wide envelope contains every member of
 * that organization, so intersecting it with a list of people yields those people.
 * People lists are assumed to belong to the same organization as the capture.
 */
export function intersectEnvelopes(a: AccessEnvelope, b: AccessEnvelope): AccessEnvelope {
  const aOrg = orgOf(a);
  const bOrg = orgOf(b);
  const aPeople = peopleOf(a);
  const bPeople = peopleOf(b);

  const sharedOrg = aOrg.filter((org) => bOrg.includes(org));
  let people: string[];
  if (aOrg.length > 0 && bOrg.length > 0) {
    people = [...aPeople, ...bPeople];
  } else if (aOrg.length > 0) {
    people = bPeople;
  } else if (bOrg.length > 0) {
    people = aPeople;
  } else {
    people = aPeople.filter((p) => bPeople.includes(p));
  }

  // When both sides are org-wide the result stays org-wide; otherwise people only.
  const principals = aOrg.length > 0 && bOrg.length > 0 ? sharedOrg : people;
  return normalizeEnvelope({ principals });
}

export function intersectAll(envelopes: AccessEnvelope[]): AccessEnvelope {
  if (envelopes.length === 0) return { principals: [] };
  return envelopes.slice(1).reduce(intersectEnvelopes, normalizeEnvelope(envelopes[0]));
}

export function envelopeAllows(envelope: AccessEnvelope, principal: Principal): boolean {
  if (envelope.principals.includes(orgPrincipal(principal.organizationId))) return true;
  return principal.emails.some((email) => envelope.principals.includes(emailPrincipal(email)));
}

/** Whether a principal may see a reviewed fact or relationship. */
export function sharedItemAllows(
  item: { envelope: string; sharing: string; ownerId: string; organizationId: string },
  principal: Principal,
): boolean {
  if (item.organizationId !== principal.organizationId) return false;
  const envelope = parseEnvelope(item.envelope);
  if (!envelopeAllows(envelope, principal)) return false;
  return item.ownerId === principal.userId || (item.sharing as Sharing) === "SOURCE_AUDIENCE";
}

export function parseEnvelope(value: string): AccessEnvelope {
  const parsed = JSON.parse(value) as AccessEnvelope;
  return normalizeEnvelope({ principals: Array.isArray(parsed.principals) ? parsed.principals : [] });
}

export function serializeEnvelope(envelope: AccessEnvelope) {
  return JSON.stringify(normalizeEnvelope(envelope));
}

/** Plain-language description of who can see something, for the review screen. */
export function describeEnvelope(envelope: AccessEnvelope): string {
  if (envelope.principals.some((p) => p.startsWith("org:"))) return "Anyone in the organization";
  const count = envelope.principals.length;
  if (count === 0) return "Nobody else";
  return `${count} ${count === 1 ? "person" : "people"}`;
}
