---
name: openai-codex-cloud-delegation
description: Run planned Codex work from the IDE into a cloud thread. Use when a task already has a plan or milestone breakdown and you want Codex cloud execution to carry over thread context, local source changes, and implementation intent, then return a reviewable diff or PR.
---

# OpenAI Codex Cloud Delegation

Use Codex cloud as a delegated implementation lane for bounded milestones, not as an unstructured dumping ground.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) when current Codex workflow, approvals, or model guidance matters.

## Best Fit

Use this skill when:

- the work already has a plan or milestone breakdown
- one milestone can be implemented and reviewed independently
- you want cloud execution to inherit existing thread context
- you expect to review a diff before merging or continuing

Do not use this skill when the task is still underspecified, the next milestone is ambiguous, or the work requires tight local interactive debugging from the start.

## Workflow

1. Confirm the task is split into milestones.
2. Set up or select the Codex cloud environment.
3. Start cloud delegation from the IDE cloud control beneath the prompt composer.
4. Let the new cloud thread inherit the existing thread context, including:
   - current plan
   - relevant discussion context
   - local source changes already present in the thread
5. Delegate exactly one bounded milestone at a time.
6. Review the cloud diff before asking for the next milestone.
7. Either:
   - create a PR directly from cloud
   - pull changes locally, test, and finish up
8. Repeat for the next milestone only after the previous one is reviewed.

## Prompt Pattern

Use prompts like:

- `Implement Milestone 1 from the plan.`
- `Implement Milestone 2 only. Preserve the prior milestone behavior and update tests if needed.`
- `Address the review feedback in the cloud diff without expanding scope beyond Milestone 1.`

Keep the ask milestone-scoped. Do not bundle multiple milestones unless they are tightly coupled and reviewable as one unit.

## Review Rules

- Review every cloud diff before continuing.
- Iterate in cloud if the changes are close and feedback is bounded.
- Pull locally when validation, manual QA, or integration checks are easier on your machine.
- Create a PR from cloud only when the milestone is reviewable as-is.

## Decision Rules

- Prefer cloud delegation for long-running implementation work with clear boundaries.
- Prefer local Codex for ambiguous design, fast back-and-forth debugging, or fragile environment issues.
- Prefer one milestone per delegation cycle.
- Stop and rescope if a milestone turns out to be too large to review comfortably.

## Output

Return:

- `cloud_readiness_check`
- `delegation_scope`
- `delegation_prompt`
- `review_checklist`
- `merge_or_pullback_recommendation`
- `next_milestone_gate`
