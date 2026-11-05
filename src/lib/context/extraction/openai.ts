import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ExtractionFailedError, type ExtractionModel, type ExtractionRequest } from "./model";
import { extractionOutputSchema, type ExtractionOutput } from "./schema";

// OpenAI implementation of the same contract. The model name is required explicitly
// (OPENAI_EXTRACTION_MODEL) rather than guessed.

/** Accepts the SDK's standard variable or the OPEN_AI_KEY spelling used in local .env files. */
export function openAIKey() {
  return process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_KEY;
}

export class OpenAIExtractionModel implements ExtractionModel {
  readonly id: string;
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(model = process.env.OPENAI_EXTRACTION_MODEL) {
    if (!model) throw new Error("Set OPENAI_EXTRACTION_MODEL to choose the OpenAI extraction model.");
    this.model = model;
    this.client = new OpenAI({ apiKey: openAIKey() });
    this.id = `openai:${model}`;
  }

  async extract(request: ExtractionRequest): Promise<ExtractionOutput> {
    const response = await this.client.responses.parse({
      model: this.model,
      instructions: request.system,
      input: request.user,
      text: { format: zodTextFormat(extractionOutputSchema, "context_extraction") },
    });
    if (!response.output_parsed) {
      throw new ExtractionFailedError("The model did not return structured extraction output.");
    }
    return response.output_parsed;
  }
}
