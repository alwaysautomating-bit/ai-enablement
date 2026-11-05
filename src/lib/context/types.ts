// Core Context Capture types. Nothing here knows about any particular organization,
// vendor, industry, or workflow — the model is domain-neutral by construction.

/** Who is asking. Resolved from a web session or an AI-client token. */
export type Principal = {
  userId: string;
  organizationId: string;
  displayName: string;
  /** Verified addresses; used to match source-system access lists. */
  emails: string[];
  /** How this principal was authenticated, recorded on audit events. */
  via: "WEB" | "MCP_CLIENT" | "EVALUATION";
  clientName?: string;
};

/**
 * Who may see a piece of information, expressed in source-system terms.
 * - `org:<organizationId>`: everyone in the organization (e.g. a public channel)
 * - `email:<address>`: a specific person (e.g. an email participant, a private-channel member)
 * An empty list means nobody — used when inputs have no overlap.
 */
export type AccessEnvelope = { principals: string[] };

export type SourceAcl = {
  /** Human-readable description of where access came from. */
  description: string;
  kind: "EMAIL_PARTICIPANTS" | "PUBLIC_CHANNEL" | "PRIVATE_CHANNEL" | "DIRECT_MESSAGE";
  memberCount: number;
};

export type SourceIdentityRef = {
  provider: string;
  externalId: string;
  displayName: string;
  email: string | null;
};

/** One message as any adapter returns it, before normalization. */
export type SourceMessage = {
  externalId: string;
  threadKey: string;
  /** Thread parent message id, when the source exposes one. */
  inReplyTo: string | null;
  container: string;
  subject: string | null;
  author: SourceIdentityRef;
  recipients: SourceIdentityRef[];
  communicatedAt: Date;
  rawText: string;
  permalink: string | null;
  envelope: AccessEnvelope;
  sourceAcl: SourceAcl;
};

export const TIME_BASIS = {
  STATED_IN_TEXT: "STATED_IN_TEXT",
  INFERRED_FROM_CONTEXT: "INFERRED_FROM_CONTEXT",
  COMMUNICATION_TIME: "COMMUNICATION_TIME",
  UNKNOWN: "UNKNOWN",
} as const;
export type TimeBasis = (typeof TIME_BASIS)[keyof typeof TIME_BASIS];

export const ASSERTION_KINDS = [
  "RELATIONSHIP",
  "RESPONSIBILITY",
  "DECISION",
  "RULE",
  "EXCEPTION",
  "OPEN_QUESTION",
] as const;
export type AssertionKind = (typeof ASSERTION_KINDS)[number];

export const MODALITIES = ["STATED", "HYPOTHETICAL", "QUESTION", "SARCASM_OR_JOKE", "UNCERTAIN"] as const;
export type Modality = (typeof MODALITIES)[number];

export const OPERATIONAL_STATUSES = ["ACTIVE", "ENDED", "PROPOSED", "ABANDONED", "UNRESOLVED"] as const;
export type OperationalStatus = (typeof OPERATIONAL_STATUSES)[number];

export const ENTITY_TYPES = [
  "PERSON",
  "ORGANIZATION",
  "TEAM",
  "ACCOUNT",
  "PROJECT",
  "PROCESS",
  "SYSTEM",
  "DOCUMENT",
  "OTHER",
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

/** The six review buckets shown to people. */
export const BUCKETS = {
  PEOPLE_AND_ENTITIES: "PEOPLE_AND_ENTITIES",
  RELATIONSHIPS: "RELATIONSHIPS",
  DECISIONS: "DECISIONS",
  RESPONSIBILITIES: "RESPONSIBILITIES",
  RULES_AND_EXCEPTIONS: "RULES_AND_EXCEPTIONS",
  OPEN_QUESTIONS: "OPEN_QUESTIONS",
} as const;
export type Bucket = (typeof BUCKETS)[keyof typeof BUCKETS];

export function bucketForKind(kind: AssertionKind): Bucket {
  switch (kind) {
    case "RELATIONSHIP":
      return BUCKETS.RELATIONSHIPS;
    case "RESPONSIBILITY":
      return BUCKETS.RESPONSIBILITIES;
    case "DECISION":
      return BUCKETS.DECISIONS;
    case "RULE":
    case "EXCEPTION":
      return BUCKETS.RULES_AND_EXCEPTIONS;
    case "OPEN_QUESTION":
      return BUCKETS.OPEN_QUESTIONS;
  }
}

/** Kinds that become temporal edges once reviewed. */
export const EDGE_KINDS: readonly AssertionKind[] = ["RELATIONSHIP", "RESPONSIBILITY"];

export const REVIEW_DECISIONS = ["CONFIRM", "CORRECT", "NOT_USEFUL"] as const;
export type ReviewDecisionType = (typeof REVIEW_DECISIONS)[number];

/**
 * Who may see a reviewed fact. It can never exceed the fact's envelope.
 * - OWNER: only the person who reviewed it
 * - SOURCE_AUDIENCE: anyone who could see every supporting message
 */
export const SHARING = ["OWNER", "SOURCE_AUDIENCE"] as const;
export type Sharing = (typeof SHARING)[number];
