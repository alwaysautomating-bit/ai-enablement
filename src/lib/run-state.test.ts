import { describe, expect, it } from "vitest";
import { assertTransition, canTransition, RUN_STATUS } from "./run-state";

describe("run state", () => {
  it("permits the governed happy path", () => {
    expect(canTransition(RUN_STATUS.DRAFT, RUN_STATUS.GATHERING)).toBe(true);
    expect(canTransition(RUN_STATUS.GATHERING, RUN_STATUS.GENERATING)).toBe(true);
    expect(canTransition(RUN_STATUS.GENERATING, RUN_STATUS.READY_FOR_REVIEW)).toBe(true);
    expect(canTransition(RUN_STATUS.READY_FOR_REVIEW, RUN_STATUS.APPROVED)).toBe(true);
  });

  it("rejects approval before review", () => {
    expect(() => assertTransition(RUN_STATUS.DRAFT, RUN_STATUS.APPROVED)).toThrow(
      "Invalid run transition",
    );
  });

  it("requires a new review cycle after approved work changes", () => {
    expect(canTransition(RUN_STATUS.APPROVED, RUN_STATUS.CHANGES_REQUESTED)).toBe(true);
    expect(canTransition(RUN_STATUS.CHANGES_REQUESTED, RUN_STATUS.GENERATING)).toBe(true);
  });
});
