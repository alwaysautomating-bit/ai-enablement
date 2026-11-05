# Context Capture Roadmap

Status: Phases 1–4 built and passing synthetic evaluation (09-29-2026); Phase 0, 5, 6 next
Last updated: 2026-09-29
Catalog epics: CX-02, CX-04, CX-05, CX-06 (see `FEATURE_CATALOG.md`)

## The Job

A person wants to understand how something actually works — an account, a process, a
project — without anyone having to write it all down first. The workspace reads the
conversations where that work already happened (email and Slack), proposes what it thinks
those conversations establish, and lets the person confirm, correct, or discard each item.
Confirmed items become durable operational context that the workspace, Codex, and Claude can
all rely on.

Hypothesis under test:

> Can AI observe the residue of ordinary work across communication systems and reconstruct
> useful operational context without requiring employees to manually document everything
> they know?

## Settled Inputs (09-26-2026)

| Question | Answer |
|---|---|
| First email provider | Gmail / Google Workspace. Outlook follows through the same adapter contract. |
| First data | Seeded fixtures first, then Laura's own Gmail and a Slack workspace she controls. |
| Codex / Claude role | Both can query reviewed context and invoke governed workflows through the app. The app remains the system of record for connections, permissions, provenance, review, and operational memory. |
| Model inside the app | Provider-agnostic extraction with Claude and OpenAI implementations. |
| Portable skills | Context Capture and lookup skills ship as `SKILL.md` packages usable in Codex and Claude Code. |
| Where v0.1 runs | Local first (localhost + SQLite). Move to Supabase/Postgres before anyone else's data is connected. |

## Architecture

```text
Gmail ─┐                                   ┌─ Workspace UI (review happens here)
Slack ─┼─> Connector adapters ─> Evidence ─┤
Fixture┘   (read-only, normalized)   │     └─ MCP server ─> Codex / Claude Code
                                     v                        (+ portable skills)
                          Extraction pipeline
                   (model provider: Claude | OpenAI)
                                     │
                                     v
                    Assertions (candidate context)
                                     │  human: Confirm / Correct / Not useful
                                     v
              Operational facts ─> Entities + temporal relationships
                                     │
                                     v
                  Permission-aware projections (the only read path)
```

Rules that shape every layer:

1. **Sources stay the system of record.** The workspace stores pointers and the minimum
   excerpt needed to support a claim, not mailbox or channel copies.
2. **Four distinct things, never collapsed:** evidence (what someone wrote) → assertion
   (what the system thinks it says) → operational fact (a reviewed assertion) →
   relationship (how that fact connects entities over time).
3. **No automatic promotion to truth.** Only a human review decision creates a fact.
4. **Change is appended, not overwritten.** A new owner closes the old relationship's
   validity window; history remains queryable.
5. **Permissions travel with information.** Every evidence row carries an access envelope.
   A derived assertion inherits the most restrictive envelope of its inputs. Widening
   visibility is an explicit, audited human decision, never a side effect.
6. **One read path.** The UI, the MCP server, and the model context assembler all read
   through the same projection service, which applies permissions *before* anything
   reaches a model or an external client.
7. **L0 stays read-only.** Connector grants for this feature request read scopes only.
   Writing back into Gmail/Slack/Asana is L1 and out of scope for v0.1.

### Mapping to the five primitives

| Primitive | Context Capture object |
|---|---|
| Entities | `OpEntity` (person, organization, account, project, process, system) + aliases |
| Events | Capture lifecycle, review decisions, relationship start/end, audit events |
| Evidence | `Evidence` rows: source pointer, minimal excerpt, hash, access envelope |
| Relationships | `Relationship` with `validFrom` / `validTo`, basis, and supersession |
| Projections | The "What I found" summary, review queue, entity timeline, MCP responses |

## Connector Contract

Adapters implement one interface. Skills and the pipeline never call a provider API
directly.

```ts
interface SourceAdapter {
  provider: "GMAIL" | "SLACK" | "FIXTURE_EMAIL" | "FIXTURE_SLACK";
  describeScopes(): ScopeExplanation[];            // shown on the permission review screen
  listScopeOptions(grant): Promise<ScopeOption[]>; // labels, channels
  collect(grant, scope: CaptureScope): AsyncIterable<SourceMessage>;
  resolveIdentity(grant, externalUserId): Promise<SourceIdentity>;
  permalink(grant, message): Promise<string | null>;
}

type SourceMessage = {
  externalId: string;          // Gmail message id | Slack channel:ts
  threadExternalId: string;
  author: SourceIdentityRef;
  recipients: SourceIdentityRef[];
  occurredAt: Date;
  text: string;                // quoted replies and signatures stripped
  permalink: string | null;
  envelope: AccessEnvelope;    // source ACL snapshot + visibility class + owner
};
```

Fixture adapters implement the same contract, so every later phase is tested against them.
Concept-level operations (`find_customer`, `get_open_work`, `create_task`) are deferred to
the Workflow Discovery phase; v0.1 only needs `collect`.

### Access scopes for v0.1

| Provider | Scopes requested | Deliberately excluded |
|---|---|---|
| Gmail | `gmail.readonly` | send, modify, compose, attachments (not fetched in v0.1) |
| Slack (user token, internal app) | `channels:read`, `channels:history`, `users:read`, `users:read.email`; `groups:read` + `groups:history` only if the person opts in to private channels | DMs and group DMs (`im:*`, `mpim:*`), any `chat:write` |

Captures are always bounded: a question, a date range, and explicitly chosen labels,
senders, or channels. Nothing crawls a whole mailbox or workspace.

## Data Model Additions

All models carry `organizationId`. Names are internal; user-facing copy follows the
Vocabulary-Earned Doctrine.

| Model | Purpose | Key fields |
|---|---|---|
| `ConnectorGrant` | One user's read-only connection to one provider account | provider, `accessMode` (always `READ` at L0), scopes, external account label, status, granted/revoked at |
| `ConnectorCredential` | Encrypted OAuth tokens, separate from grants and never audited | grantId, encrypted access/refresh token, expiresAt, keyVersion |
| `ConnectorOrientation` | Remembers completed/skipped orientation per user | userId, provider, state |
| `Capture` | One bounded investigation | question, date range, status (state machine), extractorVersion, createdBy |
| `CaptureScope` | What the capture may read | grantId, scopeType (label, query, channel), value |
| `Evidence` | Pointer to one source message | grantId, externalId, thread, author, occurredAt, retrievedAt, permalink, minimal excerpt, contentHash, access envelope, retainUntil |
| `SourceIdentity` | A person or bot as a source system knows them | provider, externalId, email, display name |
| `OpEntity` / `EntityAlias` | Resolved operational entities and their source identities/aliases | type, canonical name, status (candidate/confirmed/merged), basis |
| `Assertion` | Candidate context proposed by extraction | kind, bucket, plain-language statement, structured payload, modality, confidence, status, derived envelope |
| `AssertionEvidence` | Why the assertion exists | role (supports/contradicts/context), verified quoted span |
| `AssertionEntity` | Which entities the assertion is about | role (subject, previous owner, current owner…) |
| `ReviewDecision` | Immutable human decision | confirm / correct / not useful, correction payload, reviewer, time |
| `OperationalFact` | A reviewed assertion | origin assertion, established by/at, status, supersededBy |
| `Relationship` | Temporal edge between entities | from, type, to, validFrom, validTo, basis, factId, confidence, visibility, supersededAt |
| `ClientAccessToken` | Personal token for Codex/Claude via MCP | userId, name, hashed token, scopes, lastUsedAt, revokedAt |

Capture state machine (mirrors `run-state.ts`):

```text
DRAFT → COLLECTING → EXTRACTING → RESOLVING → READY_FOR_REVIEW → CLOSED
              ↘ FAILED / CANCELLED at any active step; FAILED may retry to COLLECTING
```

Assertion buckets for the first release: **people & entities, relationships, decisions,
responsibilities, rules & exceptions, open questions.**

Temporal example the model must support:

```text
Mike     approval_owner  Turner   … → 2026-08-14   (closed by fact F2)
Sarah    approval_owner  Turner   2026-08-14 → 2026-09-07   (closed by fact F3)
Danielle approval_owner  Turner   2026-09-07 → present
```

## Extraction Pipeline

| Stage | Kind | Notes |
|---|---|---|
| Collect | Deterministic | Adapter pulls only the declared scope; per-capture message cap (start at 500) |
| Normalize | Deterministic | Strip quoted replies/signatures, assemble threads, snapshot envelopes |
| Resolve identities | Deterministic first | Same email across Gmail and Slack profiles → same person; everything else is a *candidate* merge needing review |
| Relevance filter | Small model | Drops messages unrelated to the question; dropped count is shown, never hidden |
| Extract | Strong model, structured output | Zod-validated schema; each assertion must cite exact spans |
| Verify quotes | Deterministic | Any cited span not found verbatim in the source is rejected, not shown |
| Detect change | Model + existing facts | Proposes supersession of prior facts instead of silent overwrite |
| Summarize | Deterministic | Counts for the "What I found" screen |

The extractor also labels **modality** (stated, hypothetical, question, uncertain tone), so
sarcasm, stale instructions, and abandoned proposals surface as low-confidence items rather
than facts. Every assertion records the extractor version and model used.

Model provider interface: `ExtractionModel` with Anthropic and OpenAI implementations,
selected per workspace. Proposed defaults: a small, fast model for relevance
(`claude-haiku-4-5`) and a strong model for extraction (`claude-sonnet-5`), with an OpenAI
configuration kept at parity by the evaluation harness.

## Codex and Claude Access

The app stays authoritative; Codex and Claude are clients.

**MCP server** (`src/mcp/`, stdio for local use; HTTP + OAuth later for hosted):

| Tool | Behavior |
|---|---|
| `list_captures` | Captures the calling user can see |
| `get_capture_summary` | Six-bucket summary; reviewed items by default |
| `search_context` | Reviewed facts and relationships, each with evidence pointers |
| `get_entity_timeline` | An entity's relationships over time |
| `get_evidence` | Excerpt + permalink, only if the caller's envelope allows it |
| `start_capture` | Creates a bounded capture; results land as *needs review* in the app |

Not exposed: confirm/correct decisions, visibility widening, raw provider search, and any
write to Gmail or Slack. Unreviewed items are returned only when explicitly requested and
are always labelled as candidates. Every MCP call is authenticated with a
`ClientAccessToken`, authorized server-side through the projection service, and audited
with the client name.

Local wiring: a checked-in `.mcp.json` for Claude Code and a documented
`~/.codex/config.toml` entry for Codex, both launching the same server.

**Portable skills** (`skills/`):

- `context-capture/SKILL.md` — how an agent frames a bounded investigation, starts a
  capture, and tells the person where to review it.
- `operational-context/SKILL.md` — how an agent answers questions using reviewed context
  only, cites evidence pointers, and says when something is unreviewed or unknown.

Skills contain instructions, not credentials or data access; all access goes through the MCP
server.

## Plain-Language Flow (UI)

Internal names never lead. Proposed first-time copy:

1. Work menu entry: **"Understand how something actually works"**
2. **"What should I understand?"** — free text with examples ("How invoices actually get
   approved", "Everything about the Turner account in the last 90 days"). One primary
   question per capture.
3. **"Where do these conversations happen?"** — email and/or Slack. Optional orientation;
   mandatory read-only permission review with the exact scopes.
4. **"How far should I look?"** — date range, labels/senders, channels. DMs off.
5. Progress, then **"What I found"** — people, entities, decisions, responsibility changes,
   rules & exceptions, open questions, plus how many messages were read and set aside.
6. Review cards: statement, **"Where I saw it"** evidence with permalinks, and
   **Confirm / Correct / Not useful**.
7. Entity timeline showing who held what, and when.

Terms such as *evidence*, *assertion*, *provenance*, and *connector* become visible after
the person has used the behavior, or immediately on demand.

## Phases

Each phase is a vertical slice with its own tests and ends in a runnable state.

### Phase 0 — Real identity and secrets (prerequisite)

- Auth.js with Google sign-in; replace `DEMO_IDS` in routes with the signed-in user.
- Server-side `requireMembership(workspace, capability)` on every route (PF-01).
- AES-GCM token encryption helper keyed from env; log redaction for tokens and content.
- Record decisions: connector category, model strategy, context authorship (see
  `DECISIONS`).

Exit: every existing route authorizes a real user; authorization tests pass.

### Phase 1 — Operational context core on fixtures (no network, no model) — done

- Migration for the models above.
- `SourceAdapter` contract, fixture email + Slack adapters, and the Turner fixture set:
  responsibility changes (Mike → Sarah → Danielle), a funding relationship, a sarcastic
  remark, a hypothetical, a stale instruction, an abandoned decision, and one message the
  capturing user should not be able to see.
- Capture state machine, deterministic stub extractor, review service, fact/relationship
  supersession, projection service with envelope enforcement.

Exit: tests prove no overwrite on change, envelope inheritance on derived assertions,
rejection of unverifiable quotes, and that review is the only path to a fact.

### Phase 2 — Review experience — done

- The plain-language flow above inside the existing workspace shell, including the "What I
  found" summary, review cards, evidence reveal, and entity timeline.
- Vocabulary inventory and on-demand precision path for the new flow.

Exit: the Turner scenario runs end to end in the browser at desktop and mobile widths.

### Phase 3 — Codex and Claude access (on fixture data) — done

- Local MCP server, `ClientAccessToken` issuance/revocation screen, audit of client calls.
- `.mcp.json`, Codex config snippet, and both skills.

Exit: from Claude Code *and* Codex, ask "who approves Turner invoices and since when?" and
receive the reviewed answer with evidence pointers; unreviewed items are not presented as
fact; `start_capture` creates a capture that must be reviewed in the app.

### Phase 4 — Model-backed extraction — done (OpenAI gpt-5.5 passes; Anthropic not yet run)

- `ExtractionModel` interface with Anthropic and OpenAI implementations, versioned extractor
  prompt, relevance filter, cost caps, and retry/failure states.
- Evaluation harness with gold labels for the fixture set.

Exit criteria (proposed): 100% of shown quotes verify; at least 80% of gold assertions
found; none of the planted traps presented as high confidence; results recorded per
provider.

### Phase 5 — Live Gmail, read-only

- Google Cloud project with the OAuth app in Testing mode and Laura as the test user;
  `gmail.readonly` via incremental consent; encrypted tokens; disconnect and revoke.
- Gmail adapter with query/label/date bounds.

Exit: a real bounded capture on Laura's mailbox, reviewed in the app.

### Phase 6 — Live Slack, read-only, and cross-source capture

- Internal (non-distributed) Slack app in a workspace Laura controls; user-token read
  scopes above; permalinks; identity match to Gmail by profile email.

Exit: one real question produces linked assertions from both Slack and Gmail — the central
hypothesis gets its first real-data answer.

### Phase 7 — Gate before anyone else's data

- Move to Supabase/Postgres with RLS and reviewed migrations (never `db push`).
- Google OAuth verification and security assessment for the restricted Gmail scope.
- Slack distribution and API-terms review.
- Model data-handling review (retention, training use) and a Privacy Scrubber decision for
  captured content.
- Retention and deletion: disconnect purges unreviewed excerpts; defined retention for
  reviewed evidence.
- Multi-user, permission-aware projections and an explicit "share with the team" decision
  for widening visibility.

Exit: a pilot organization can connect without any boundary depending on "only Laura uses
it."

## After v0.1

In order of expected value, each reusing the same contract:

1. Outlook and Teams adapters (Microsoft Graph).
2. Drive / SharePoint documents as evidence.
3. Asana workflow state and ownership.
4. Concept-level connector operations (`find_customer`, `get_open_work`, …).
5. Workflow Discovery skill over captured context, then AI Opportunity Mapper, Software
   Reality Mapper, AI Readiness Review, Implementation Designer, and Measurement Designer.
6. AI Initiative workspace ("Accounts Payable Modernization") that recommends sources and
   explains why each one is useful before asking for access.
7. L1 bounded actions back into systems (for example `create_task`), with separately granted
   write scopes and pre-action review.
8. Organizational capability map built from completed initiatives.

## Risks and Things to Verify

| Risk | Mitigation |
|---|---|
| `gmail.readonly` is a restricted Google scope; Testing-mode refresh tokens expire after about 7 days | Fine for Laura's own use; verification and assessment are a Phase 7 gate before any pilot |
| Slack API terms and rate limits for storing message data and using it with LLMs have changed recently | Verify current terms before Phase 6; the pointer + minimal-excerpt design adapts either way; use an internal app |
| Real email/Slack content sent to a model provider before the Privacy Scrubber exists | Own data only until Phase 7; choose provider settings with no training use |
| Extraction confidently wrong (sarcasm, stale, hypothetical) | Modality labels, quote verification, trap fixtures, human review as the only path to fact |
| Permission flattening through derived assertions | Envelope inheritance plus a single projection read path, tested in Phase 1 |
| Scope creep toward "understand the whole company" | One question per capture, bounded scope, message caps |
| Tokens or content leaking into logs/audit | Separate credential table, redaction, metadata-only audit events |

## Needed From Laura, and When

| When | What |
|---|---|
| Phase 1 | Review the Turner fixture story for realism; add a trap or two from real experience |
| Phase 4 | Anthropic and/or OpenAI API key in local `.env` |
| Phase 5 | A Google Cloud project you own, for the OAuth client |
| Phase 6 | A Slack workspace where you can install an internal app; which channels to test |
| Phase 6 | The first real question to run, for example how a specific process actually works |
