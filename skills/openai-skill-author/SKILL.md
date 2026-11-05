---
name: openai-skill-author
description: Decide whether a recurring OpenAI-platform workflow should become a reusable skill, then draft the skill design. Use when a process repeats often enough that it should be captured as a `SKILL.md`, reference bundle, or operational playbook for future agents.
---

# OpenAI Skill Author

Turn recurring platform decisions and operating procedures into reusable skills.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) when the workflow depends on current OpenAI primitives, tools, or Codex behavior.

## Workflow

1. Identify the recurring workflow.
2. Check whether the repetition is primarily:
   - architecture choice
   - procedural instructions
   - deterministic execution
   - reusable references or templates
3. Decide whether it should become:
   - a skill
   - a tool
   - an MCP surface
   - a document or checklist only
4. If it should be a skill, define:
   - trigger conditions
   - inputs
   - outputs
   - decision rules
   - failure cases
   - required references or scripts

## Decision Rules

- Use a skill when the work is primarily reusable judgment or procedure.
- Use a tool when the work is primarily computation or action.
- Use MCP when the value is live external capability or context.
- Do not create a skill for one-off instructions or trivial style preferences.
- Keep skills narrow enough that they trigger reliably.

## Output

Return:

- `should_become_a_skill`
- `why_or_why_not`
- `skill_name`
- `skill_scope`
- `trigger_description`
- `inputs_and_outputs`
- `resources_to_bundle`
- `failure_modes`
