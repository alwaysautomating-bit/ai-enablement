---
name: promote-pork
description: Evaluate whether an agent, skill, workflow, instruction, design system, or project artifact contains durable operational knowledge that should be promoted into a canonical PORK concept. Use when Codex needs to separate reusable knowledge from implementation residue, decide whether an artifact should survive beyond its source tool or repo, or draft a portable promotion record with source evidence and backlinks.
---

# Promote PORK

Identify reusable operational knowledge inside an artifact and decide whether it should become a canonical PORK concept.

Do not invent new knowledge. Extract, compress, and promote only what the source artifact already teaches.

## Workflow

1. Inspect the source artifact directly.
2. Identify the operational knowledge it contains.
3. Test that knowledge against the promotion rubric in [references/promotion-rubric.md](references/promotion-rubric.md).
4. Decide whether to promote, reject, or defer.
5. Draft a canonical concept only when the artifact passes the rubric.
6. Preserve source links so a human can review the promotion.

## Inspect The Right Source

Prefer the most primary artifact available:

- A live skill folder over a generated registry entry
- A workflow or instruction document over a summary of it
- A source design system document over a downstream implementation

If multiple artifacts repeat the same concept, treat them as corroborating evidence, not separate concepts.

Do not promote:

- Cache files
- Temporary outputs
- Build artifacts
- Runtime metadata
- One-off transcripts unless they clearly encode a reusable method

## Extract The Knowledge

Name the thing the artifact teaches in plain language before deciding anything else.

Look for knowledge such as:

- A reasoning model
- A decision rule
- A workflow pattern
- A durable rubric
- A design language
- An operating principle
- A reusable method for coordinating agents, humans, or tools

If the artifact mainly contains implementation details, local wiring, or transient state, stop and reject promotion.

## Decide Promotion

Use the rubric in [references/promotion-rubric.md](references/promotion-rubric.md).

Promote only when the concept is all of the following:

- Portable across humans and runtimes
- Reusable across more than one task, workflow, or project
- Conceptual rather than incidental
- Durable enough to remain useful over time

When the answer is mixed, prefer `defer` over forcing a promotion.

## Draft The Canonical Concept

When promoting, produce a compact record with:

- Concept title
- Portable concept statement
- Problem it solves
- Why it should survive the death of the source tool
- Source references
- Related concepts
- Related agents
- Related skills
- Related workflows
- Human-review note

Keep the draft implementation-agnostic. Rewrite local jargon only when doing so preserves meaning and improves portability.

## Produce A Clear Verdict

Return one of these verdicts:

- `promote`: The artifact contains durable reusable knowledge and should become a canonical concept.
- `defer`: The idea may matter, but the evidence or shape is not clean enough yet.
- `reject`: The artifact is implementation residue, temporary state, or too local to promote.

Always include a short reason tied to the rubric.

## Repo-Specific Navigation

When working inside the `conTEXT` repository, check these locations before drafting a new concept:

- `knowledge/okf/agents/`
- `knowledge/okf/skills/`
- `knowledge/okf/workflows/`
- `knowledge/okf/instructions/`
- `knowledge/okf/migration/`
- `knowledge/skills/`
- `knowledge/agents/`
- `knowledge/pork/`

Use them to avoid duplicate promotions and to preserve backlinks to existing canonical material.
