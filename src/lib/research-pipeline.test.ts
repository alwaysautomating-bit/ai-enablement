import { describe, expect, it } from "vitest";
import {
  buildReviewItems,
  generateFirstDraft,
  improveDraft,
} from "./research-pipeline";

const input = {
  question: "Where should operations teams invest next?",
  audience: "Leadership team",
  priority: "Identify the strongest unmet need",
  sourceNames: ["Interview notes", "Market landscape"],
};

describe("research pipeline", () => {
  it("creates a complete deterministic first draft", () => {
    const draft = generateFirstDraft(input);
    expect(draft.executive).toContain(input.question);
    expect(draft.findings).toContain("Interview notes");
    expect(draft.flaggedClaim).toContain("should be checked");
    expect(draft.recommendation).toContain("Leadership team");
  });

  it("improves the draft without hiding the flagged claim", () => {
    const first = generateFirstDraft(input);
    const improved = improveDraft(input, first);
    expect(improved.executive.length).toBeGreaterThan(first.executive.length);
    expect(improved.flaggedClaim).toBe(first.flaggedClaim);
  });

  it("requires source, scope, and audience review", () => {
    expect(buildReviewItems().map((item) => item.category)).toEqual([
      "SOURCE",
      "SCOPE",
      "AUDIENCE",
    ]);
  });
});
