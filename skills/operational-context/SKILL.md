---
name: operational-context
description: Answer questions about how the organization's work operates — who is responsible for what, since when, what was decided, which rules and exceptions apply — using people-reviewed context from the AI Enablement Workspace, with provenance. Use before guessing about ownership, approvals, handoffs, or process rules. Requires the ai-enablement-context MCP server.
---

# Operational Context

Answers come only from context a person has confirmed in the AI Enablement Workspace, and
only what the asking person is allowed to see. Every answer carries where it came from.

## Steps

1. Call `search_context` with the names and topic from the question. For "who / since
   when / what changed", also call `get_entity_timeline` for the main entity.
2. Answer from items with status `CONFIRMED`. Items with `CONFIRMED_BUT_SUPERSEDED` are
   history: use them to explain what changed, not as the current state.
3. Keep the two times apart:
   - **When it was true** — `operationalTime` / `validFrom`–`validTo`.
   - **When it was said** — `firstCommunicatedAt` and each source's `communicatedAt`.
   Say so when they differ ("decided Aug 12, announced Aug 14").
4. Cite provenance briefly for each claim: who said it, where, and when — for example
   "Sarah, #ops chat, Aug 14". Use `get_evidence` only when the person wants the full
   message.
5. If nothing confirmed covers the question, say that plainly. You may mention
   `UNREVIEWED_CANDIDATE` items only when asked, labelled as not yet confirmed, and suggest
   reviewing them in the workspace.

## Rules

- Never present an unreviewed candidate as fact.
- Absence of a result is not evidence of absence; the person may lack access, or nobody has
  confirmed it yet. Do not speculate about hidden items.
- If a timeline entry says it was ended by "a later change you do not have access to", say
  the arrangement ended and that the details are restricted. Do not guess the reason.
- Do not combine confirmed context with outside assumptions without marking which is which.
