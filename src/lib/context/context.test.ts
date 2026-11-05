import { describe, expect, it } from "vitest";
import { FixtureChatAdapter } from "./adapters/fixture";
import { ScopeRefusedError, type GrantRecord } from "./adapters/types";
import { startCapture } from "./capture-service";
import { envelopeAllows, intersectAll, intersectEnvelopes } from "./envelope";
import { evaluate } from "./eval/evaluate";
import { createScratchDatabase } from "./eval/test-db";
import { RecordedExtractionModel } from "./extraction/recorded";
import { RECORDED_EXTRACTION_PATH } from "./extraction/select";
import { locateQuote } from "./extraction/verify";
import { principalForUser } from "./principal";
import { normalizeText, reconstruct } from "./reconstruct";
import { reviewAssertion } from "./review-service";
import { sameFixturePath } from "./pork";
import { ensureSampleContextData } from "./sample-data";
import type { Principal, SourceMessage } from "./types";

const principal = (emails: string[]): Principal => ({
  userId: "u",
  organizationId: "org_a",
  displayName: "Test",
  emails,
  via: "EVALUATION",
});

describe("access envelopes", () => {
  it("never lets derived information escape its inputs", () => {
    const org = { principals: ["org:org_a"] };
    const email = { principals: ["email:a@x", "email:b@x"] };
    const channel = { principals: ["email:b@x", "email:c@x"] };
    expect(intersectEnvelopes(org, email).principals).toEqual(["email:a@x", "email:b@x"]);
    expect(intersectAll([org, email, channel]).principals).toEqual(["email:b@x"]);
    expect(envelopeAllows(intersectAll([email, channel]), principal(["a@x"]))).toBe(false);
    expect(envelopeAllows(org, principal(["anyone@x"]))).toBe(true);
    expect(intersectAll([]).principals).toEqual([]);
  });
});

describe("quote verification", () => {
  it("accepts exact words despite typographic differences and rejects paraphrase", () => {
    const text = "Heads up — per Wednesday’s ops sync,\n don't send invoices anymore.";
    expect(locateQuote(text, "per Wednesday's ops sync, don't send")).not.toBeNull();
    expect(locateQuote(text, "per the Wednesday meeting")).toBeNull();
    const at = locateQuote(text, "ops sync")!;
    expect(text.slice(at.start, at.end)).toBe("ops sync");
  });
});

describe("conversation reconstruction", () => {
  const base = {
    inReplyTo: null,
    container: "Email",
    subject: null,
    recipients: [],
    permalink: null,
    envelope: { principals: ["org:org_a"] },
    sourceAcl: { description: "", kind: "EMAIL_PARTICIPANTS" as const, memberCount: 1 },
  };
  const author = { provider: "E", externalId: "a", displayName: "Ann Lee", email: "a@x" };

  it("strips signatures and re-quoted history", () => {
    const { body, quotedBlocks } = normalizeText("Approved.\n\nOn Mon, Ann wrote:\n> old text\n--\nsig");
    expect(body).toBe("Approved.");
    expect(quotedBlocks[0]).toContain("old text");
  });

  it("marks forwards as duplicates and links threads that quote each other", () => {
    const messages: SourceMessage[] = [
      { ...base, externalId: "m1", threadKey: "t1", author, communicatedAt: new Date("2026-01-01"), rawText: "The handoff happens Monday and covers every open item." },
      {
        ...base,
        externalId: "m2",
        threadKey: "t2",
        author,
        communicatedAt: new Date("2026-01-02"),
        rawText: "FYI.\n\n---------- Forwarded message ---------\nFrom: Ann\nThe handoff happens Monday and covers every open item.",
      },
    ];
    const result = reconstruct(messages);
    const forward = result.messages.find((m) => m.externalId === "m2")!;
    expect(forward.duplicateOf).toBe("m1");
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].basis.join(" ")).toContain("quotes m1");
  });
});

describe("source adapters", () => {
  const grant: GrantRecord = {
    id: "g",
    provider: "FIXTURE_CHAT",
    accessMode: "READ",
    scopes: "[]",
    accountLabel: "chat",
    accountIdentity: "laura@example.local",
    config: JSON.stringify({ corpusPath: sameFixturePath("corpus.json") }),
    status: "ACTIVE",
    organizationId: "org_demo",
    userId: "user_laura",
  };

  it("refuses private channels the account is not in and direct messages", async () => {
    const adapter = new FixtureChatAdapter();
    await expect(adapter.collect(grant, [{ scopeType: "CHAT_CHANNEL", value: "C-LEAD", label: "" }], { start: null, end: null })).rejects.toBeInstanceOf(ScopeRefusedError);
    await expect(adapter.collect(grant, [{ scopeType: "CHAT_CHANNEL", value: "D-LAURA-SARAH", label: "" }], { start: null, end: null })).rejects.toBeInstanceOf(ScopeRefusedError);
    const options = await adapter.listScopeOptions(grant);
    expect(options.map((o) => o.value)).not.toContain("C-LEAD");
  });
});

describe("review governance", () => {
  it("allows one decision per candidate, only by its owner", async () => {
    const { db } = createScratchDatabase();
    await ensureSampleContextData(db);
    const laura = (await principalForUser(db, "user_laura", "EVALUATION"))!;
    const marcus = (await principalForUser(db, "user_marcus", "EVALUATION"))!;
    const grant = await db.sourceGrant.findFirstOrThrow({ where: { userId: laura.userId, provider: "FIXTURE_CHAT" } });
    const { captureId } = await startCapture(
      db,
      laura,
      {
        question: "Who approves vendor invoices now?",
        windowStart: null,
        windowEnd: null,
        scopes: [{ grantId: grant.id, scopeType: "CHAT_CHANNEL", value: "C-OPS", label: "#construction-ops" }],
      },
      new RecordedExtractionModel(RECORDED_EXTRACTION_PATH),
    );
    const candidate = await db.assertion.findFirstOrThrow({ where: { captureId } });
    await expect(reviewAssertion(db, marcus, candidate.id, { decision: "CONFIRM", visibility: "OWNER" })).rejects.toThrow();
    const first = await reviewAssertion(db, laura, candidate.id, { decision: "CONFIRM", visibility: "OWNER" });
    expect(first.factId).toBeTruthy();
    await expect(reviewAssertion(db, laura, candidate.id, { decision: "CONFIRM", visibility: "OWNER" })).rejects.toThrow(
      "already been reviewed",
    );
    await db.$disconnect();
  });
});

describe("synthetic evaluation (recorded extractor)", () => {
  it("passes the complete evidence → review → timeline → MCP loop", async () => {
    const { db } = createScratchDatabase();
    const report = await evaluate({
      db,
      model: new RecordedExtractionModel(RECORDED_EXTRACTION_PATH),
      goldPath: sameFixturePath("gold.json"),
    });
    await db.$disconnect();
    const failed = report.checks.filter((check) => !check.passed);
    expect(failed).toEqual([]);
    expect(report.rejectedBeforeReview).toHaveLength(1);
  }, 60_000);
});
