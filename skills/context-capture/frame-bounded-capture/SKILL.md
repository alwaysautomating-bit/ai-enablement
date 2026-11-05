---
name: frame-bounded-capture
description: Frame and start a read-only, permission-bounded capture when someone needs to reconstruct how a process, account, project, or handoff operates from work conversations.
metadata:
  domain: context-capture
  source: AI Enablement Workspace context-capture workflow, promoted 2026-09-29 and migrated 2026-10-20
---

# Frame a Bounded Capture

The consuming runtime holds source connections, enforces permissions, preserves provenance, and controls human review. This skill frames a useful capture; it never decides what is true.

1. Frame one primary operational question in the user's language.
2. Bound the date window and authorized places. Default to the last 90 days only when the user gives no better boundary.
3. Start the capture with `bounded-context-capture`.
4. Report the number of messages read and candidates proposed. Label every proposed item as unreviewed.
5. Hand the capture to a human reviewer for confirmation, correction, or rejection.
6. After review, use `answer-from-reviewed-context` for operational answers.

Do not widen visibility, read unauthorized locations, write to source systems, or work around a runtime refusal. If scope is too broad, narrow it.
