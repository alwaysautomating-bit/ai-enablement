import { createHash } from "node:crypto";
import type { SourceMessage } from "./types";

// Conversation reconstruction is deterministic and domain-neutral. It turns a pile of
// messages from different systems into conversations the extractor and reviewer can
// follow, and records *why* messages were linked so the grouping itself has provenance.

export type NormalizedMessage = SourceMessage & {
  /** Text the person actually wrote, with signatures and re-quoted history removed. */
  body: string;
  /** What is stored and shown as evidence: the body plus any quoted content not collected elsewhere. */
  excerpt: string;
  contentHash: string;
  duplicateOf: string | null;
  references: string[];
  conversationKey: string;
};

export type ReconstructedConversation = {
  key: string;
  label: string;
  messageIds: string[];
  threadKeys: string[];
  basis: string[];
  startedAt: Date;
  endedAt: Date;
};

export type Reconstruction = {
  messages: NormalizedMessage[];
  conversations: ReconstructedConversation[];
};

const QUOTE_HEADER = /^On .+wrote:\s*$/;
const FORWARD_HEADER = /^-{2,}\s*(Forwarded message|Original Message)\s*-*$/i;
const HEADER_LINE = /^(From|Date|Sent|To|Cc|Subject):\s/i;
const SIGNATURE = /^--\s*$/;

export function normalizeText(rawText: string): { body: string; quotedBlocks: string[]; forwarded: boolean } {
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  const bodyLines: string[] = [];
  const quotedBlocks: string[] = [];
  let current: string[] | null = null;
  let forwarded = false;
  let inSignature = false;

  for (const line of lines) {
    if (current) {
      if (HEADER_LINE.test(line)) continue;
      current.push(line.replace(/^>\s?/, ""));
      continue;
    }
    if (QUOTE_HEADER.test(line.trim()) || FORWARD_HEADER.test(line.trim())) {
      forwarded = forwarded || FORWARD_HEADER.test(line.trim());
      current = [];
      quotedBlocks.push("");
      continue;
    }
    if (line.startsWith(">")) {
      quotedBlocks.push(line.replace(/^>\s?/, ""));
      continue;
    }
    if (SIGNATURE.test(line)) {
      inSignature = true;
      continue;
    }
    if (!inSignature) bodyLines.push(line);
  }
  if (current) quotedBlocks[quotedBlocks.length - 1] = current.join("\n").trim();

  return {
    body: collapse(bodyLines.join("\n")),
    quotedBlocks: quotedBlocks.map(collapse).filter(Boolean),
    forwarded,
  };
}

function collapse(text: string) {
  return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Comparison key that ignores case, punctuation, and whitespace. */
export function contentKey(text: string) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function hashContent(text: string) {
  return createHash("sha256").update(contentKey(text)).digest("hex");
}

function identifierTokens(text: string) {
  const tokens = new Set<string>();
  for (const match of text.matchAll(/\b[A-Za-z]{0,6}-?(\d{3,})\b/g)) {
    const digits = match[1];
    const year = Number(digits);
    if (digits.length === 4 && year >= 1900 && year <= 2099) continue;
    tokens.add(digits);
  }
  return tokens;
}

function normalizedSubject(subject: string | null) {
  if (!subject) return null;
  return subject.replace(/^((re|fw|fwd)\s*:\s*)+/i, "").trim().toLowerCase() || null;
}

const REFERENCE_PHRASE = /\b([A-Z][a-z]+)['’]s (email|message|note|post|thread)\b/g;

class UnionFind {
  private parent = new Map<string, string>();
  find(key: string): string {
    if (!this.parent.has(key)) this.parent.set(key, key);
    const parent = this.parent.get(key)!;
    if (parent === key) return key;
    const root = this.find(parent);
    this.parent.set(key, root);
    return root;
  }
  union(a: string, b: string) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent.set(rootB, rootA);
  }
}

const DAY = 24 * 60 * 60 * 1000;

export function reconstruct(input: SourceMessage[]): Reconstruction {
  const sorted = [...input].sort((a, b) => a.communicatedAt.getTime() - b.communicatedAt.getTime());
  const byId = new Map(sorted.map((message) => [message.externalId, message]));
  const normalized = new Map<string, { body: string; quotedBlocks: string[]; forwarded: boolean }>();
  for (const message of sorted) normalized.set(message.externalId, normalizeText(message.rawText));

  const results: Omit<NormalizedMessage, "conversationKey">[] = [];
  const linkBasis = new Map<string, Set<string>>(); // thread-pair key -> reasons
  const threads = new UnionFind();
  const addLink = (a: string, b: string, reason: string) => {
    if (a === b) return;
    threads.union(a, b);
    const key = [a, b].sort().join("|");
    if (!linkBasis.has(key)) linkBasis.set(key, new Set());
    linkBasis.get(key)!.add(reason);
  };

  for (const message of sorted) {
    const { body, quotedBlocks, forwarded } = normalized.get(message.externalId)!;
    threads.find(message.threadKey);
    const references: string[] = [];
    const uncollectedQuotes: string[] = [];
    let duplicateOf: string | null = null;

    for (const block of quotedBlocks) {
      const blockKey = contentKey(block);
      const source = sorted.find((other) => {
        if (other.externalId === message.externalId) return false;
        if (other.communicatedAt > message.communicatedAt) return false;
        const otherKey = contentKey(normalized.get(other.externalId)!.body);
        return otherKey.length > 0 && blockKey.includes(otherKey);
      });
      if (source) {
        references.push(source.externalId);
        if (source.threadKey !== message.threadKey) {
          addLink(message.threadKey, source.threadKey, `${message.externalId} quotes ${source.externalId}`);
        }
        if (forwarded && contentKey(body).length < 80) duplicateOf = source.externalId;
      } else {
        uncollectedQuotes.push(block);
      }
    }

    // Identical content posted twice is duplicate information, not two sources.
    const hash = hashContent(body);
    const identical = results.find((earlier) => earlier.contentHash === hash && contentKey(body).length > 0);
    if (!duplicateOf && identical) duplicateOf = identical.externalId;

    if (message.inReplyTo && byId.has(message.inReplyTo)) {
      const parent = byId.get(message.inReplyTo)!;
      if (parent.threadKey !== message.threadKey) {
        addLink(message.threadKey, parent.threadKey, `${message.externalId} replies to ${parent.externalId}`);
      }
    }

    const excerpt = uncollectedQuotes.length
      ? `${body}\n\n[Quoted content]\n${uncollectedQuotes.join("\n\n")}`
      : body;

    results.push({
      ...message,
      body,
      excerpt,
      contentHash: hash,
      duplicateOf,
      references,
    });
  }

  // Cross-thread links: same subject, shared identifiers, explicit references to another
  // person's message. Each link records its reason.
  for (let i = 0; i < results.length; i += 1) {
    const a = results[i];
    const aTokens = identifierTokens(`${a.subject ?? ""} ${a.body}`);
    for (let j = i + 1; j < results.length; j += 1) {
      const b = results[j];
      if (a.threadKey === b.threadKey) continue;
      const subjectA = normalizedSubject(a.subject);
      if (subjectA && subjectA === normalizedSubject(b.subject)) {
        addLink(a.threadKey, b.threadKey, `same subject "${subjectA}"`);
      }
      const closeInTime = Math.abs(a.communicatedAt.getTime() - b.communicatedAt.getTime()) <= 21 * DAY;
      if (closeInTime) {
        const shared = [...identifierTokens(`${b.subject ?? ""} ${b.body}`)].filter((token) => aTokens.has(token));
        if (shared.length > 0) addLink(a.threadKey, b.threadKey, `shared identifier ${shared.join(", ")}`);
      }
    }
  }

  for (const message of results) {
    for (const match of message.body.matchAll(REFERENCE_PHRASE)) {
      const firstName = match[1].toLowerCase();
      const target = [...results]
        .reverse()
        .find(
          (candidate) =>
            candidate.externalId !== message.externalId &&
            candidate.threadKey !== message.threadKey &&
            candidate.author.displayName.toLowerCase().split(/\s+/)[0] === firstName &&
            candidate.communicatedAt <= message.communicatedAt &&
            message.communicatedAt.getTime() - candidate.communicatedAt.getTime() <= 3 * DAY,
        );
      if (target) {
        addLink(message.threadKey, target.threadKey, `${message.externalId} refers to ${match[0]} (${target.externalId})`);
      }
    }
  }

  const groups = new Map<string, NormalizedMessage[]>();
  const final: NormalizedMessage[] = results.map((message) => {
    const conversationKey = threads.find(message.threadKey);
    const withKey = { ...message, conversationKey };
    if (!groups.has(conversationKey)) groups.set(conversationKey, []);
    groups.get(conversationKey)!.push(withKey);
    return withKey;
  });

  const conversations: ReconstructedConversation[] = [...groups.entries()].map(([key, messages]) => {
    const threadKeys = [...new Set(messages.map((message) => message.threadKey))];
    const basis = [...linkBasis.entries()]
      .filter(([pair]) => pair.split("|").every((threadKey) => threadKeys.includes(threadKey)))
      .flatMap(([, reasons]) => [...reasons]);
    const first = messages[0];
    const containers = [...new Set(messages.map((message) => message.container.split(" · ")[0]))];
    const label = first.subject ?? `${first.container}: ${first.body.split(/\s+/).slice(0, 8).join(" ")}…`;
    return {
      key,
      label: containers.length > 1 ? `${label} (${containers.join(" + ")})` : label,
      messageIds: messages.map((message) => message.externalId),
      threadKeys,
      basis: threadKeys.length > 1 ? basis : ["single thread"],
      startedAt: messages[0].communicatedAt,
      endedAt: messages[messages.length - 1].communicatedAt,
    };
  });

  return { messages: final, conversations };
}
