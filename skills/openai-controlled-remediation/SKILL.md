---
name: openai-controlled-remediation
description: Decide whether a detected issue can be safely remediated on the OpenAI platform and under what control mode. Use when a system has already found a bug, policy issue, operational anomaly, or compliance problem and the next question is whether to report it, propose a fix, create an isolated patch, require approval, or block remediation entirely.
---

# OpenAI Controlled Remediation

Detection can be automated. Remediation must be controlled.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) when current automation, approvals, worktree, MCP, or Codex safety guidance matters.

## Workflow

1. Restate the finding clearly.
2. Classify:
   - severity
   - blast radius
   - reversibility
   - system affected
   - whether the issue touches regulated or sensitive domains
3. Choose the maximum allowed remediation mode:
   - read-only report
   - backlog or ticket only
   - draft PR
   - proposed patch in isolated worktree
   - human approval required before any change
   - blocked from autonomous remediation
4. If bounded remediation is allowed, make the smallest safe change.
5. Verify the change with the narrowest relevant check.
6. Report evidence, verification, and any remaining risk.
7. Stop after the bounded action. Do not widen scope opportunistically.

## Never Auto-Remediate

Never auto-remediate:

- payments
- approvals
- access permissions
- customer data deletion
- encryption or security policy changes
- production configuration
- legal or compliance records
- anything irreversible

These require explicit human review and approval at minimum, and often should remain recommendation-only.

## Usually Allowed Without Prior Approval

These are usually acceptable when clearly bounded and isolated:

- create a report
- create a backlog item
- draft a PR
- propose a patch in an isolated worktree
- add tests
- update documentation

Even here, stop if the change scope expands beyond the original finding.

## Decision Rules

- Prefer read-only reporting when severity or uncertainty is high.
- Prefer a draft PR or isolated worktree over direct mutation.
- Require human approval for anything with customer, financial, security, access, or compliance impact.
- If the issue cannot be fixed without changing policy, production configuration, or irreversible state, block autonomous remediation.
- Verification is required for any implemented remediation.

## Output

Return:

- `finding_summary`
- `severity_class`
- `allowed_remediation_mode`
- `why_that_mode`
- `verification_plan`
- `evidence_to_report`
- `stop_or_escalation_condition`
