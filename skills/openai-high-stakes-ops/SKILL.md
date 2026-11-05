---
name: openai-high-stakes-ops
description: Design OpenAI agent workflows for operations, compliance, and other high-stakes environments with near-zero tolerance for error. Use when the system must be auditable, policy-constrained, approval-aware, and resistant to unsafe autonomous actions.
---

# OpenAI High-Stakes Ops

Design for controlled reliability, not maximum autonomy.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) when current approvals, automations, MCP security, observability, or Codex policy guidance matters.

## Core Posture

In high-stakes environments, optimize for:

- bounded authority
- explicit approvals
- auditability
- deterministic checks
- separation of duties
- reversible changes

Do not optimize first for convenience, speed, or full autonomy.

## Workflow

1. Define the harm model:
   - what could go wrong
   - who is affected
   - what is irreversible
2. Identify the control surface:
   - read-only analysis
   - recommendation only
   - draft generation
   - action with human approval
   - action without approval
3. Minimize authority until the last possible step.
4. Define evidence and verification requirements.
5. Define audit and retention needs.
6. Define who must review, approve, or sign off.

## Design Rules

- Prefer recommend-and-review patterns before action-taking patterns.
- Prefer read-only tools before write-capable tools.
- Prefer connectors, MCP allow-lists, and narrow tool surfaces over broad shell access.
- Use worktrees and isolated environments for code or document modifications.
- Require explicit validation for every mutation path.
- Treat automation as higher risk than interactive use because it runs unattended.
- If `approval_policy = "never"` is allowed, use it only for truly bounded, low-blast-radius workflows.
- For zero-tolerance workflows, keep a human approval gate for any state-changing action.

## Skills and Automations in High-Stakes Environments

Use skills to encode:

- operating procedures
- evidence requirements
- escalation rules
- output schema
- failure handling

Use automations only when:

- the prompt is durable
- the sandbox is appropriately constrained
- the reporting threshold is explicit
- the blast radius is small and understood
- each run is auditable afterward

## Compliance-Oriented Patterns

- recommendation only plus human execution
- draft artifact plus approval
- read-only monitoring plus triage alert
- bounded auto-remediation in isolated worktree or sandbox
- post-action verification plus audit record

## Output

Return:

- `risk_class`
- `allowed_agent_authority`
- `required_approvals`
- `required_evidence_and_validation`
- `tool_and_sandbox_constraints`
- `audit_and_trace_requirements`
- `recommended_skill_and_automation_pattern`
