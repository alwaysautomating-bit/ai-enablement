---
name: openai-agent-architect
description: Design an OpenAI agent system without jumping into implementation. Use when the task is to decide what agents exist, what each one owns, which tools and skills they need, how memory works, and whether the system should use agents at all.
---

# OpenAI Agent Architect

Design the agent system shape first. Do not drift into code generation unless explicitly asked.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) for current agent, tool, retrieval, and Codex references when needed.

## Workflow

1. Define the user-facing outcome.
2. Identify distinct responsibilities:
   - planning
   - retrieval
   - execution
   - review
   - delivery
3. Decide whether one agent is enough.
4. If not, split by ownership boundary, not by arbitrary persona.
5. For each agent, specify:
   - goal
   - inputs
   - tools
   - memory needs
   - handoff or return conditions
6. Design the shared system pieces:
   - skills
   - MCPs
   - vector stores
   - approvals
   - traces and evals

## Design Rules

- Start with one agent unless specialization materially improves reliability.
- Add a new agent only when it has a distinct tool surface, memory boundary, or success metric.
- Use tools for capabilities. Use agents for autonomous judgment and bounded ownership.
- Use handoffs when control should transfer. Use agent-as-tool when a specialist should answer and return.
- Keep orchestration legible enough that a human can explain why each agent exists.

## Output

Return:

- `system_goal`
- `recommended_topology`
- `agents`
- `shared_tools_and_skills`
- `memory_and_retrieval`
- `approvals_and_guardrails`
- `observability`
- `implementation_order`

Name what should *not* be an agent.
