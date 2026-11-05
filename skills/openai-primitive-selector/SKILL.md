---
name: openai-primitive-selector
description: Choose the correct OpenAI platform primitive for a problem. Use when a user asks "should this be an MCP, skill, file search, agent, handoff, connector, Codex workflow, tool search, shell, computer use, automation, or retrieval system?" or when architecture work is blocked on picking the right primitive first.
---

# OpenAI Primitive Selector

Select the smallest OpenAI primitive that solves the core problem without overbuilding.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) when the choice depends on current platform guidance or exact tool capabilities.

## Workflow

1. Restate the job to be done in one sentence.
2. Classify the main need:
   - knowledge or memory
   - external system access
   - repeatable operating procedure
   - code or terminal execution
   - UI interaction
   - orchestration between specialists
   - delayed or scheduled work
   - coding and repo execution
3. Pick the lightest primitive that fits.
4. Only add a second primitive when the first one clearly cannot satisfy the requirement alone.
5. Explain why the rejected alternatives are heavier, riskier, or less direct.

## Default Mapping

- Need grounded answers over uploaded documents: `file_search`
- Need custom semantic search infrastructure or indexing control: retrieval or vector stores
- Need short-lived conversational continuity: conversation state or sessions
- Need long-lived learned context across runs: memory pattern, usually with retrieval or session storage
- Need external systems or SaaS tools: MCP or connectors
- Need a reusable operating procedure: skill
- Need command execution or build-test loops: shell
- Need Python/data analysis: Code Interpreter
- Need browser or app UI interaction: computer use
- Need too many possible tools to expose up front: tool search
- Need ownership transfer to another specialist: handoff
- Need a specialist called by another agent without taking over: agent as tool
- Need scheduled or background work: background responses or automations in the host system
- Need repo-aware software engineering: Codex

## Escalation Rules

- Prefer a single agent before multi-agent orchestration.
- Prefer connectors before custom MCP when an official connector already fits.
- Prefer `file_search` before custom retrieval infrastructure when the requirement is ordinary grounded Q&A.
- Prefer a skill before a new tool when the problem is procedural rather than computational.
- Prefer Codex before building a custom coding harness unless the product itself requires one.

## Output

Return:

- `recommended_primitive`
- `why_this_fits`
- `alternatives_considered`
- `required_companions`
- `implementation_note`
- `risks_or_limits`

Keep the answer architecture-first, not API-first.
