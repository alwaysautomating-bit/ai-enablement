---
name: openai-automation-architect
description: Design recurring Codex automations and background agent workflows. Use when deciding whether work should be a thread automation, standalone automation, project automation, worktree-backed run, local run, or skill-driven recurring task, especially for recurring triage, monitoring, bugfix, review, and reporting loops.
---

# OpenAI Automation Architect

Design unattended work so each run is durable, reviewable, and appropriately isolated.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) when current Codex automation, skills, approvals, or sandbox guidance matters.

## Workflow

1. Define the recurring job.
2. Decide whether each run should:
   - continue the same thread context
   - start fresh
   - operate on one project
   - operate across multiple projects
3. Choose the automation type:
   - thread automation
   - standalone automation
   - project automation
4. Choose the execution location:
   - local project
   - background worktree
5. Choose whether the task should explicitly invoke a skill.
6. Set:
   - cadence
   - stop conditions
   - report threshold
   - approval and sandbox expectations

## Decision Rules

- Use a thread automation when the work should preserve the current thread context.
- Use a standalone automation when each run should be independent and show up as separate triage items.
- Use project automation when the work is tied to one or more specific repositories.
- Use worktrees for Git repositories when you need automation changes isolated from in-progress local work.
- Use local mode only when the automation intentionally works in the main checkout and file collisions are acceptable.
- Use a skill when the recurring work depends on a stable workflow, not just a one-line prompt.
- Test the prompt manually before scheduling it.

## Durable Prompt Rules

Each automation prompt should define:

- what to do on every run
- what evidence to inspect
- what counts as a meaningful finding
- when to report
- when to stop, archive, or ask for input

Avoid prompts that depend on accidental current-thread wording or hidden human context.

## High-Risk Automation Rules

- Prefer `workspace-write` over full access unless there is a clear reason otherwise.
- Prefer worktrees over local mode for code-changing automations.
- Require explicit validation steps for code changes.
- Do not allow unattended write-capable automations without clear scope boundaries.
- Use skills plus rules when the workflow must stay maintainable across teams.

## Output

Return:

- `recommended_automation_type`
- `execution_location`
- `skill_usage`
- `cadence_recommendation`
- `durable_prompt`
- `sandbox_and_approval_notes`
- `review_and_cleanup_plan`
