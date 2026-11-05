---
id: knowledge.knowledge-context-skill-tool-separation
type: knowledge
title: Knowledge, Context, Skill, and Tool Separation
status: canonical-draft
---

# Knowledge, Context, Skill, and Tool Separation

Reusable systems should separate stable understanding, current project state,
executable procedure, and runtime mechanism.

## The four layers

- **Knowledge** explains durable concepts, constraints, patterns, and tradeoffs.
- **Context** supplies facts about the particular project and moment in which a
  task is performed.
- **Skill** defines a bounded decision and execution procedure.
- **Tool** provides the callable mechanism used by the skill.

The normal flow is:

```text
task -> project context -> relevant knowledge -> skill -> tools -> result
```

Large, stable knowledge should be retrieved when relevant rather than injected
into every run. Project context should remain local and current instead of being
promoted as universal doctrine. Skills should reference the knowledge they need
without duplicating it, and tools should expose mechanisms without deciding when
their use is warranted.

## Decision before mechanism

A skill associated with a tool must not assume that the tool should be used. It
should begin by determining whether the mechanism provides a concrete benefit
under the current constraints. If it does not, the skill should preserve the
simpler valid approach.

This prevents capability-driven behavior: possessing a Docker, database,
framework, or deployment skill is not evidence that the corresponding technology
belongs in the solution.

## Docker example

Docker concepts belong primarily in platform knowledge and consulted reference
material. A containerization skill can remain small: inspect the project, decide
whether isolation or deployment consistency justifies Docker, select a suitable
pattern, implement it, verify it, and record the new operational assumptions.
Ports, service versions, deployment targets, and topology remain project context.

## Source

- `reference.docker-knowledge-skill-context-separation`

## Related concepts

- `knowledge.recommendation-permission-execution`
- `knowledge.evidence-grounding`

## Human-review note

Technology adoption can affect security, deployment, cost, and maintenance.
Material architecture changes should remain reviewable even when the execution
procedure is automated.

