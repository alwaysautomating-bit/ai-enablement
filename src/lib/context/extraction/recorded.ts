import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ExtractionModel, ExtractionRequest } from "./model";
import { extractionOutputSchema, type ExtractionOutput } from "./schema";

// Test double: replays a recorded model response so the whole loop can run offline and
// deterministically. It is not an extractor — it only knows the corpus it was recorded
// against, and it never runs on live sources.

type RecordedFile = { model: string; corpusId: string; output: unknown };

export class RecordedExtractionModel implements ExtractionModel {
  readonly id: string;
  readonly corpusId: string;
  private readonly output: ExtractionOutput;

  constructor(path: string) {
    const file = JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as RecordedFile;
    this.output = extractionOutputSchema.parse(file.output);
    this.corpusId = file.corpusId;
    this.id = `recorded:${file.model}`;
  }

  async extract(request: ExtractionRequest): Promise<ExtractionOutput> {
    const inBatch = new Set(request.messageIds);
    const assertions = this.output.assertions
      .map((assertion) => ({
        ...assertion,
        evidence: assertion.evidence.filter((item) => inBatch.has(item.messageId)),
      }))
      .filter((assertion) => assertion.evidence.some((item) => item.role === "SUPPORTS"));
    const used = new Set(assertions.flatMap((a) => [a.subjectRef, a.objectRef]).filter(Boolean));
    const entities = this.output.entities.filter(
      (entity) => used.has(entity.ref) || entity.aliases.length > 0 || entity.identityKey,
    );
    return { entities, assertions };
  }
}
