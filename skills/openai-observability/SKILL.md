---
name: openai-observability
description: Design tracing, evaluations, approvals, auditability, and decision logging for OpenAI agent systems. Use when the question is how to know what happened, why the agent acted, whether it was correct, and how to review or govern it later.
---

# OpenAI Observability

Make the system inspectable before scaling it.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) for traces, approvals, Codex security, and agent workflow references.

## Workflow

1. Identify the critical decisions the system makes.
2. Decide what must be observable:
   - inputs and outputs
   - tool calls
   - approvals
   - retrieval evidence
   - handoffs
   - failures and retries
3. Define how quality is checked:
   - traces
   - evals
   - review loops
   - audit records
4. Separate operational telemetry from compliance or governance logs.

## Design Rules

- Log enough to reconstruct the decision path without logging more sensitive data than necessary.
- Capture approval events explicitly.
- Trace handoffs and tool invocations as first-class events.
- Define evals around real failure modes, not just happy-path correctness.
- Include reviewer-visible evidence for grounded answers and high-risk actions.

## Output

Return:

- `trace_plan`
- `approval_audit_plan`
- `evaluation_plan`
- `decision_log_fields`
- `alert_or_review_triggers`
- `privacy_and_retention_notes`
