import { z } from "zod";
import { ASSERTION_KINDS, ENTITY_TYPES, MODALITIES, OPERATIONAL_STATUSES, TIME_BASIS } from "../types";

// The structured output every extraction model must return. Nullable instead of
// optional so the same schema works with strict structured-output modes.

export const extractedEntitySchema = z.object({
  ref: z.string().describe("Short local id such as e1, used by assertions in this response."),
  type: z.enum(ENTITY_TYPES),
  name: z.string().describe("Most complete name used for this entity in the messages."),
  aliases: z.array(z.string()).describe("Other names, abbreviations, or informal references used for the same entity."),
  identityKey: z
    .string()
    .nullable()
    .describe("For people listed in KNOWN PEOPLE, their identityKey. Otherwise null."),
  distinctFrom: z
    .array(z.string())
    .describe("Refs of similarly named entities that the messages show are different."),
});

export const extractedEvidenceSchema = z.object({
  messageId: z.string(),
  quote: z.string().describe("Exact words copied from that message's text. Never paraphrase."),
  role: z.enum(["SUPPORTS", "CONTRADICTS", "CONTEXT"]),
});

export const extractedAssertionSchema = z.object({
  kind: z.enum(ASSERTION_KINDS),
  statement: z.string().describe("One plain-language sentence a colleague would understand."),
  subjectRef: z.string().nullable(),
  predicate: z
    .string()
    .nullable()
    .describe("snake_case relation name for RELATIONSHIP and RESPONSIBILITY; reuse EXISTING PREDICATES when they fit."),
  objectRef: z.string().nullable(),
  holderCardinality: z
    .enum(["ONE", "MANY"])
    .nullable()
    .describe("ONE when only one subject can hold this predicate for the object at a time."),
  operationalStatus: z.enum(OPERATIONAL_STATUSES),
  modality: z.enum(MODALITIES),
  confidence: z.number().describe("0 to 1."),
  effectiveFrom: z.string().nullable().describe("YYYY-MM-DD when this became true in the operation, if knowable."),
  effectiveTo: z.string().nullable().describe("YYYY-MM-DD when this stopped being true, if knowable."),
  timeBasis: z.enum([
    TIME_BASIS.STATED_IN_TEXT,
    TIME_BASIS.INFERRED_FROM_CONTEXT,
    TIME_BASIS.COMMUNICATION_TIME,
    TIME_BASIS.UNKNOWN,
  ]),
  timeExpression: z.string().nullable().describe("The words that established the time, e.g. 'as of Monday'."),
  evidence: z.array(extractedEvidenceSchema),
  supersedesFactIds: z.array(z.string()).describe("Ids from EXISTING CONFIRMED CONTEXT this replaces."),
  rationale: z.string().describe("Why the evidence supports this, including doubts."),
});

export const extractionOutputSchema = z.object({
  entities: z.array(extractedEntitySchema),
  assertions: z.array(extractedAssertionSchema),
});

export type ExtractedEntity = z.infer<typeof extractedEntitySchema>;
export type ExtractedAssertion = z.infer<typeof extractedAssertionSchema>;
export type ExtractionOutput = z.infer<typeof extractionOutputSchema>;
