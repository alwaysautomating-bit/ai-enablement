import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { ExtractionFailedError, type ExtractionModel, type ExtractionRequest } from "./model";
import { extractionOutputSchema, type ExtractionOutput } from "./schema";

// Claude implementation. Structured output keeps the response schema-valid; streaming
// avoids request timeouts on long captures. Server-side refusal fallbacks are enabled so
// a declined request is retried on a fallback model instead of failing the capture.

export const DEFAULT_ANTHROPIC_MODEL = "claude-opus-5";

export class AnthropicExtractionModel implements ExtractionModel {
  readonly id: string;
  private readonly client: Anthropic;

  constructor(private readonly model = process.env.CONTEXT_ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL) {
    this.client = new Anthropic();
    this.id = `anthropic:${model}`;
  }

  async extract(request: ExtractionRequest): Promise<ExtractionOutput> {
    const stream = this.client.beta.messages.stream({
      model: this.model,
      max_tokens: 64000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      system: request.system,
      messages: [{ role: "user", content: request.user }],
      output_config: { format: zodOutputFormat(extractionOutputSchema) },
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      throw new ExtractionFailedError("The model declined to process these messages.");
    }
    if (message.stop_reason === "max_tokens") {
      throw new ExtractionFailedError("The extraction was cut off. Narrow the scope and try again.");
    }

    const text = message.content
      .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");
    const parsed = extractionOutputSchema.safeParse(JSON.parse(text));
    if (!parsed.success) throw new ExtractionFailedError("The model returned output in an unexpected shape.");
    return parsed.data;
  }
}
