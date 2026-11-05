import { AnthropicExtractionModel } from "./anthropic";
import type { ExtractionModel } from "./model";
import { OpenAIExtractionModel, openAIKey } from "./openai";
import { RecordedExtractionModel } from "./recorded";

export const RECORDED_EXTRACTION_PATH = "fixtures/context/turner-ap/recorded-extraction.json";

/**
 * Chooses the extraction model from configuration.
 * CONTEXT_EXTRACTOR=anthropic | openai | recorded. Without it, a configured Anthropic or
 * OpenAI key is used; otherwise the recorded double (sample data only).
 */
export function selectExtractionModel(name = process.env.CONTEXT_EXTRACTOR): ExtractionModel {
  const choice =
    name ??
    (process.env.ANTHROPIC_API_KEY
      ? "anthropic"
      : openAIKey() && process.env.OPENAI_EXTRACTION_MODEL
        ? "openai"
        : "recorded");
  switch (choice) {
    case "anthropic":
      return new AnthropicExtractionModel();
    case "openai":
      return new OpenAIExtractionModel();
    case "recorded":
      return new RecordedExtractionModel(process.env.CONTEXT_RECORDED_EXTRACTION ?? RECORDED_EXTRACTION_PATH);
    default:
      throw new Error(`Unknown extractor "${choice}". Use anthropic, openai, or recorded.`);
  }
}
