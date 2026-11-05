import type { ExtractionOutput } from "./schema";

// The provider-agnostic extraction contract. Claude, OpenAI, and the recorded test
// double all implement it; nothing downstream knows which one ran.

export type ExtractionRequest = {
  system: string;
  user: string;
  /** Messages included in this batch; outputs citing anything else are rejected later. */
  messageIds: string[];
};

export interface ExtractionModel {
  /** Recorded on every assertion, e.g. "anthropic:claude-opus-5". */
  readonly id: string;
  extract(request: ExtractionRequest): Promise<ExtractionOutput>;
}

export class ExtractionFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractionFailedError";
  }
}
