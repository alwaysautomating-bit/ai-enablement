---
name: openai-workflow-architect
description: Choose the right OpenAI orchestration pattern. Use when deciding between a single agent, agent-as-tool, handoffs, manager-worker, staged pipelines, or other workflow patterns for a product or internal system.
---

# OpenAI Workflow Architect

Choose the workflow topology that best matches the task shape.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) for current handoff, multi-agent, session, and conversation-state guidance.

## Workflow

1. Define the unit of work.
2. Decide whether the work is:
   - one coherent task
   - multiple specialist tasks
   - serial stages
   - parallel subtasks
   - ownership-transfer work
3. Choose the simplest viable pattern:
   - single agent
   - agent as tool
   - handoff
   - manager-worker
   - staged workflow
4. Define stop conditions, retries, and reviewer checkpoints.

## Pattern Rules

- Use a single agent by default.
- Use agent-as-tool when a specialist should answer and return control.
- Use a handoff when the specialist should own the next portion of the interaction.
- Use manager-worker when multiple bounded tasks can run independently and roll up to one coordinator.
- Use staged workflows when sequence matters more than autonomy.

## Output

Return:

- `recommended_pattern`
- `why_this_pattern`
- `execution_flow`
- `handoff_or_return_rules`
- `parallelism_opportunities`
- `risk_points`
