---
name: context-capture
description: Reconstruct how some piece of work actually operates — who is responsible, what was decided, which rules and exceptions apply, what changed and when — from the person's connected email and chat, through the AI Enablement Workspace. Use when someone wants to understand a process, account, project, or handoff from the conversations where it happened, rather than from documentation. Requires the ai-enablement-context MCP server.
---

# Context Capture

The AI Enablement Workspace is the system of record. It holds the person's read-only
connections, applies their permissions, keeps provenance, and is the only place where
candidate context becomes confirmed. You help frame a good question, start a bounded
capture, and point the person to review. You never decide what is true.

## When to use

- "How does X actually get approved / handled / paid?"
- "Who owns X now, and what changed?"
- "Catch me up on everything about <account/project> in the last N days."

If the person only wants an answer from context that already exists, use the
`operational-context` skill instead — check `search_context` first; a capture may be
unnecessary.

## Steps

1. **Frame one question.** Ask for the job in the person's own words. If they say "all of
   it", ask which one outcome matters most first. Keep a single primary question per
   capture.
2. **Bound it.** Agree on a date range (default: last 90 days) and where to look. Call
   `list_sources` and name the places in plain language ("the #ops channel and your
   email"). Direct messages are never read; do not suggest them.
3. **Start it.** Call `start_capture` with `question`, `window_start`, `window_end`, and
   `places` (grant_id, scope_type, value from `list_sources`).
4. **Report honestly.** Say how many messages were read and how many items were proposed.
   Everything proposed is **unreviewed**. Do not summarize unreviewed items as findings.
5. **Hand off review.** Tell the person to open the workspace, choose "Understand how
   something actually works", and confirm, correct, or mark each item not useful. Mention
   that each item shows when it was true separately from when it was said.
6. **After review**, answer with the `operational-context` skill.

## Rules

- Do not paraphrase unreviewed candidates as facts, even when confidence is high.
- Do not try to widen who can see something; sharing is decided in the workspace.
- Do not try to write to email or chat. This capability is read-only.
- If `start_capture` refuses (too many messages, a place the account cannot read), relay
  the reason and suggest narrowing — do not work around it.
