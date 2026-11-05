import type { NormalizedMessage, ReconstructedConversation } from "../reconstruct";


// The extraction instructions are canonical in PORK (skill extract-candidate-operational-context)
// and are read from the pinned stack; see ../pork.ts. This module only renders the runtime
// input: reconstructed conversations and the permission-filtered context shown to the model.

export type PromptContext = {
  question: string;
  windowStart: Date | null;
  windowEnd: Date | null;
  people: Array<{ identityKey: string; displayName: string; aliases: string[] }>;
  knownEntities: Array<{ name: string; entityType: string; aliases: string[] }>;
  existingFacts: Array<{ id: string; statement: string; predicate: string | null; effectiveFrom: Date | null }>;
  existingPredicates: string[];
};

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function stamp(date: Date) {
  const iso = date.toISOString();
  return `${iso.slice(0, 10)} (${WEEKDAY[date.getUTCDay()]}) ${iso.slice(11, 16)} UTC`;
}

function identityKeyOf(message: NormalizedMessage["author"]) {
  return message.email ? `email:${message.email}` : `${message.provider}:${message.externalId}`;
}

export function renderMessage(message: NormalizedMessage) {
  const lines = [
    `[${message.externalId}] ${stamp(message.communicatedAt)} · ${message.container}${
      message.subject ? ` · Subject: ${message.subject}` : ""
    }`,
    `From: ${message.author.displayName} <${identityKeyOf(message.author)}>${
      message.recipients.length
        ? ` · To: ${message.recipients.map((r) => `${r.displayName} <${identityKeyOf(r)}>`).join(", ")}`
        : ""
    }`,
  ];
  if (message.inReplyTo) lines.push(`In reply to: ${message.inReplyTo}`);
  if (message.duplicateOf) lines.push(`DUPLICATE of ${message.duplicateOf} — repeats that message.`);
  if (message.references.length) lines.push(`Quotes: ${message.references.join(", ")}`);
  lines.push("Text:", message.excerpt || "(empty)");
  return lines.join("\n");
}

export function buildUserPrompt(
  context: PromptContext,
  conversations: ReconstructedConversation[],
  messages: Map<string, NormalizedMessage>,
) {
  const sections: string[] = [];
  sections.push(`QUESTION: ${context.question}`);
  sections.push(
    `CAPTURE WINDOW: ${context.windowStart ? context.windowStart.toISOString().slice(0, 10) : "open"} to ${
      context.windowEnd ? context.windowEnd.toISOString().slice(0, 10) : "open"
    }`,
  );
  sections.push(
    "KNOWN PEOPLE:\n" +
      (context.people.length
        ? context.people
            .map((p) => `- ${p.identityKey} — ${p.displayName}${p.aliases.length ? ` (also: ${p.aliases.join(", ")})` : ""}`)
            .join("\n")
        : "- none"),
  );
  sections.push(
    "KNOWN ENTITIES (reuse these names when they match):\n" +
      (context.knownEntities.length
        ? context.knownEntities
            .map((e) => `- ${e.name} [${e.entityType}]${e.aliases.length ? ` aliases: ${e.aliases.join(", ")}` : ""}`)
            .join("\n")
        : "- none"),
  );
  sections.push(
    "EXISTING CONFIRMED CONTEXT:\n" +
      (context.existingFacts.length
        ? context.existingFacts
            .map(
              (f) =>
                `- ${f.id}: ${f.statement}${f.predicate ? ` [${f.predicate}]` : ""}${
                  f.effectiveFrom ? ` (from ${f.effectiveFrom.toISOString().slice(0, 10)})` : ""
                }`,
            )
            .join("\n")
        : "- none"),
  );
  sections.push(`EXISTING PREDICATES: ${context.existingPredicates.length ? context.existingPredicates.join(", ") : "none"}`);

  const rendered = conversations.map((conversation, index) => {
    const header = `=== Conversation ${index + 1}: ${conversation.label}\nLinked because: ${conversation.basis.join("; ")}`;
    const body = conversation.messageIds
      .map((id) => messages.get(id))
      .filter((message): message is NormalizedMessage => Boolean(message))
      .map(renderMessage)
      .join("\n\n");
    return `${header}\n\n${body}`;
  });
  sections.push(`CONVERSATIONS:\n\n${rendered.join("\n\n")}`);
  return sections.join("\n\n");
}
