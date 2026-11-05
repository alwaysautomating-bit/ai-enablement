---
name: openai-codex-workflow
description: Design how Codex should execute a build or engineering task. Use when deciding between local work, cloud delegation, subagents, automation, approvals, model choice, and validation flow for Codex-based software engineering.
---

# OpenAI Codex Workflow

Plan how Codex should build the thing before asking it to build.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) for Codex configuration, approvals, subagents, code generation, and model references.

## Workflow

1. Define the engineering outcome.
2. Classify the task:
   - local repo implementation
   - long-running delegated work
   - repeated automation
   - review or debugging
   - documentation or release support
3. Decide execution mode:
   - local interactive Codex
   - Codex with subagents
   - cloud or remote execution
   - automation-triggered run
4. Set:
   - model choice
   - approval mode
   - validation commands
   - artifact expectations

## Decision Rules

- Prefer local interactive Codex for ambiguous or high-feedback work.
- Prefer subagents only for bounded parallel tasks with clear ownership.
- Prefer automation for repeatable, policy-stable workflows.
- Use GPT-5.5 as the default coding model unless cost, latency, or explicit target constraints say otherwise.
- Require explicit validation commands for code changes.

## Output

Return:

- `workflow_recommendation`
- `execution_mode`
- `model_and_reasoning`
- `approval_and_permissions`
- `validation_plan`
- `artifacts_to_expect`
- `risks`
