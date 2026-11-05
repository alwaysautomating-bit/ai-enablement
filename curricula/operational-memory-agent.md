# Operational Memory Agent Curriculum

## Goal

Teach an agent to reconstruct operational reality from incomplete, conflicting, and evolving evidence without overstating certainty.

## Required Concepts

- SAME
- Evidence Weighting
- BAE
- Context Reconstruction
- Advanced Workflow Patterns

## Optional Concepts

- Design System Rules

## Not Needed

- Design System Rules are not strictly required for core reasoning.
  Why: the agent can reason correctly without a UI system, though communication improves if it learns one.

## Learning Order

1. SAME
2. Evidence Weighting
3. BAE
4. Context Reconstruction
5. Advanced Workflow Patterns
6. Design System Rules

## Build Pattern

The agent first resolves whether entities collapse together, then weighs evidence quality, then generates the best explanation, then reconstructs a timeline, then selects the next safe workflow step.

## Required Concepts Declaration

- `required_concepts`: SAME, Evidence Weighting, BAE, Context Reconstruction, Advanced Workflow Patterns
- `optional_concepts`: Design System Rules
- `not_needed`: none at core reasoning layer
- `why`: operational memory agents must resolve identity, compare evidence, explain uncertainty, reconstruct history, and act through staged workflows

## Test

Use [lab-001-operational-memory-agent.md](/evaluations/operational-memory/scenarios/lab-001.md) with the [operational-memory-test-packet.md](/evaluations/operational-memory/fixtures/test-packet.md) and score against [operational-memory-eval.md](/evaluations/operational-memory/rubric.md).
