---
name: openai-conversation-state
description: Design how conversation state should work on the OpenAI platform. Use when deciding between manual history replay, `previous_response_id`, the Conversations API, sessions, compaction, or context-window controls, especially for multi-turn agents, chat apps, or tool-heavy Responses workflows.
---

# OpenAI Conversation State

Choose the lightest conversation-state pattern that preserves the right context without bloating the prompt.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) when current Responses, phase, compaction, or session guidance matters.

## Workflow

1. Define how long the system needs to remember context:
   - one request only
   - one short thread
   - a persisted conversation across sessions or devices
   - long-running agent workflow
2. Decide the state mechanism:
   - manual message replay
   - `previous_response_id`
   - Conversations API
   - sessions or app-level memory layer
3. Check the retrieval and token implications.
4. Define truncation, compaction, and fallback behavior.
5. Verify whether assistant `phase` values must be preserved.

## Decision Rules

- Use manual history replay only when you need full application control over exactly what is passed back.
- Use `previous_response_id` for simple threaded continuation when Responses chaining is enough.
- Use the Conversations API when the conversation should be durable across sessions, devices, or jobs.
- Use sessions or a higher memory layer when the need goes beyond plain turn history.
- Preserve assistant-item `phase` values exactly if your integration manually replays assistant items in long-running or tool-heavy workflows.
- Do not confuse conversation history with durable organizational memory.

## Context Window Rules

- Count input, output, and reasoning tokens against the context budget.
- Plan compaction before conversations get large.
- Use retrieval or file search for reference knowledge instead of stuffing everything into chat history.
- If a previous response cannot be resolved in WebSocket continuation, fall back to a fresh turn with full input context.

## Output

Return:

- `recommended_state_pattern`
- `why_this_pattern`
- `persistence_scope`
- `phase_and_replay_requirements`
- `context_window_strategy`
- `compaction_strategy`
- `risks_and_failure_modes`
