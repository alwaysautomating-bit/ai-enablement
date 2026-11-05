import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { emailPrincipal, orgPrincipal } from "../envelope";
import type { SourceIdentityRef, SourceMessage } from "../types";
import {
  ScopeRefusedError,
  type CollectWindow,
  type GrantRecord,
  type ScopeOption,
  type ScopeSelection,
  type SourceAdapter,
} from "./types";

// Fixture adapters read a synthetic corpus file in a generic email + chat format.
// They enforce the same visibility rules a live provider would: an email account sees
// only messages it participated in; a chat account reads public channels and private
// channels it belongs to; direct messages are not offered in this release.

export type FixtureCorpus = {
  id: string;
  description: string;
  people: Array<{
    key: string;
    name: string;
    email: string;
    chatUserId: string | null;
    chatDisplayName: string | null;
  }>;
  email: {
    messages: Array<{
      id: string;
      threadId: string;
      inReplyTo: string | null;
      subject: string;
      from: string;
      to: string[];
      cc: string[];
      sentAt: string;
      labels: string[];
      body: string;
    }>;
  };
  chat: {
    workspaceName: string;
    channels: Array<{
      id: string;
      name: string;
      visibility: "public" | "private" | "direct";
      members: string[];
    }>;
    messages: Array<{
      id: string;
      channel: string;
      threadOf: string | null;
      user: string;
      ts: string;
      text: string;
    }>;
  };
};

export const FIXTURE_PROVIDERS = {
  EMAIL: "FIXTURE_EMAIL",
  CHAT: "FIXTURE_CHAT",
} as const;

const corpusCache = new Map<string, FixtureCorpus>();

export function loadCorpus(corpusPath: string): FixtureCorpus {
  const absolute = resolve(process.cwd(), corpusPath);
  const cached = corpusCache.get(absolute);
  if (cached) return cached;
  const corpus = JSON.parse(readFileSync(absolute, "utf8")) as FixtureCorpus;
  corpusCache.set(absolute, corpus);
  return corpus;
}

function corpusFor(grant: GrantRecord) {
  const config = JSON.parse(grant.config) as { corpusPath?: string };
  if (!config.corpusPath) throw new Error("Fixture grant is missing its corpus path.");
  return loadCorpus(config.corpusPath);
}

function inWindow(date: Date, window: CollectWindow) {
  if (window.start && date < window.start) return false;
  if (window.end && date > window.end) return false;
  return true;
}

function personByEmail(corpus: FixtureCorpus, email: string) {
  return corpus.people.find((person) => person.email.toLowerCase() === email.toLowerCase());
}

function emailIdentity(corpus: FixtureCorpus, email: string): SourceIdentityRef {
  const person = personByEmail(corpus, email);
  return {
    provider: FIXTURE_PROVIDERS.EMAIL,
    externalId: email.toLowerCase(),
    displayName: person?.name ?? email,
    email: email.toLowerCase(),
  };
}

function chatIdentity(corpus: FixtureCorpus, userId: string): SourceIdentityRef {
  const person = corpus.people.find((candidate) => candidate.chatUserId === userId);
  return {
    provider: FIXTURE_PROVIDERS.CHAT,
    externalId: userId,
    displayName: person?.name ?? person?.chatDisplayName ?? userId,
    email: person?.email.toLowerCase() ?? null,
  };
}

export class FixtureEmailAdapter implements SourceAdapter {
  readonly provider = FIXTURE_PROVIDERS.EMAIL;
  readonly plainName = "Email (sample mailbox)";

  describeScopes() {
    return [
      {
        scope: "mail.read",
        plainLanguage: "Read messages you sent or received in the date range and folders you choose.",
      },
      { scope: "(not requested) send, delete, or change mail", plainLanguage: "Nothing can be sent or changed." },
    ];
  }

  private visibleMessages(grant: GrantRecord) {
    const corpus = corpusFor(grant);
    const owner = grant.accountIdentity.toLowerCase();
    return corpus.email.messages.filter((message) =>
      [message.from, ...message.to, ...message.cc].map((a) => a.toLowerCase()).includes(owner),
    );
  }

  async listScopeOptions(grant: GrantRecord): Promise<ScopeOption[]> {
    const labels = new Set(this.visibleMessages(grant).flatMap((message) => message.labels));
    return [
      { scopeType: "EMAIL_ALL", value: "*", label: "All mail in the date range", unavailableReason: null },
      ...[...labels].sort().map((label) => ({
        scopeType: "EMAIL_LABEL",
        value: label,
        label: `Folder: ${label}`,
        unavailableReason: null,
      })),
    ];
  }

  async collect(grant: GrantRecord, scope: ScopeSelection[], window: CollectWindow): Promise<SourceMessage[]> {
    const corpus = corpusFor(grant);
    const all = scope.some((item) => item.scopeType === "EMAIL_ALL");
    const labels = scope.filter((item) => item.scopeType === "EMAIL_LABEL").map((item) => item.value);
    if (!all && labels.length === 0) return [];

    return this.visibleMessages(grant)
      .filter((message) => all || message.labels.some((label) => labels.includes(label)))
      .filter((message) => inWindow(new Date(message.sentAt), window))
      .map((message) => {
        const participants = [message.from, ...message.to, ...message.cc].map((a) => a.toLowerCase());
        return {
          externalId: message.id,
          threadKey: `email:${message.threadId}`,
          inReplyTo: message.inReplyTo,
          container: message.labels.length ? `Email · ${message.labels.join(", ")}` : "Email · Inbox",
          subject: message.subject,
          author: emailIdentity(corpus, message.from),
          recipients: [...message.to, ...message.cc].map((address) => emailIdentity(corpus, address)),
          communicatedAt: new Date(message.sentAt),
          rawText: message.body,
          permalink: `fixture://${corpus.id}/email/${message.id}`,
          envelope: { principals: [...new Set(participants)].map(emailPrincipal) },
          sourceAcl: {
            description: `Email participants (${new Set(participants).size})`,
            kind: "EMAIL_PARTICIPANTS",
            memberCount: new Set(participants).size,
          },
        } satisfies SourceMessage;
      });
  }

  async resolveIdentity(grant: GrantRecord, externalId: string) {
    return emailIdentity(corpusFor(grant), externalId);
  }
}

export class FixtureChatAdapter implements SourceAdapter {
  readonly provider = FIXTURE_PROVIDERS.CHAT;
  readonly plainName = "Team chat (sample workspace)";

  describeScopes() {
    return [
      { scope: "channels:history", plainLanguage: "Read public channels you choose, in the date range you choose." },
      {
        scope: "groups:history",
        plainLanguage: "Read private channels you already belong to, only if you choose them.",
      },
      { scope: "(not requested) direct messages", plainLanguage: "Direct messages are never read." },
      { scope: "(not requested) post or edit", plainLanguage: "Nothing can be posted or changed." },
    ];
  }

  private ownerUserId(grant: GrantRecord) {
    const corpus = corpusFor(grant);
    return personByEmail(corpus, grant.accountIdentity)?.chatUserId ?? null;
  }

  async listScopeOptions(grant: GrantRecord): Promise<ScopeOption[]> {
    const corpus = corpusFor(grant);
    const owner = this.ownerUserId(grant);
    return corpus.chat.channels
      .filter((channel) => channel.visibility === "public" || (owner && channel.members.includes(owner)))
      .map((channel) => ({
        scopeType: "CHAT_CHANNEL",
        value: channel.id,
        label: channel.visibility === "direct" ? `Direct messages: ${channel.name}` : `#${channel.name}`,
        unavailableReason: channel.visibility === "direct" ? "Direct messages are not read." : null,
      }));
  }

  async collect(grant: GrantRecord, scope: ScopeSelection[], window: CollectWindow): Promise<SourceMessage[]> {
    const corpus = corpusFor(grant);
    const owner = this.ownerUserId(grant);
    const requested = scope.filter((item) => item.scopeType === "CHAT_CHANNEL").map((item) => item.value);

    const channels = requested.map((id) => {
      const channel = corpus.chat.channels.find((candidate) => candidate.id === id);
      if (!channel) throw new ScopeRefusedError(`Unknown channel ${id}.`);
      if (channel.visibility === "direct") throw new ScopeRefusedError("Direct messages are not read.");
      if (channel.visibility === "private" && !(owner && channel.members.includes(owner))) {
        throw new ScopeRefusedError("This account cannot read that private channel.");
      }
      return channel;
    });

    return channels.flatMap((channel) =>
      corpus.chat.messages
        .filter((message) => message.channel === channel.id)
        .filter((message) => inWindow(new Date(message.ts), window))
        .map((message) => {
          const memberEmails = channel.members
            .map((id) => corpus.people.find((person) => person.chatUserId === id)?.email)
            .filter((email): email is string => Boolean(email));
          const envelope =
            channel.visibility === "public"
              ? { principals: [orgPrincipal(grant.organizationId)] }
              : { principals: memberEmails.map(emailPrincipal) };
          return {
            externalId: message.id,
            threadKey: `chat:${channel.id}:${message.threadOf ?? message.id}`,
            inReplyTo: message.threadOf,
            container: `#${channel.name}`,
            subject: null,
            author: chatIdentity(corpus, message.user),
            recipients: [],
            communicatedAt: new Date(message.ts),
            rawText: message.text,
            permalink: `fixture://${corpus.id}/chat/${channel.id}/${message.id}`,
            envelope,
            sourceAcl: {
              description:
                channel.visibility === "public"
                  ? `Public channel #${channel.name}`
                  : `Private channel #${channel.name} (${channel.members.length} members)`,
              kind: channel.visibility === "public" ? "PUBLIC_CHANNEL" : "PRIVATE_CHANNEL",
              memberCount: channel.members.length,
            },
          } satisfies SourceMessage;
        }),
    );
  }

  async resolveIdentity(grant: GrantRecord, externalId: string) {
    return chatIdentity(corpusFor(grant), externalId);
  }
}
