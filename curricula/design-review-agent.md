# Design Review Agent Curriculum

## Goal

Teach an agent to review visual or interaction work with evidence-backed reasoning and system-level communication rules.

## Required Concepts

- Evidence Weighting
- Design System Rules
- Context Reconstruction

## Optional Concepts

- SAME
- BAE
- Advanced Workflow Patterns

## Not Needed

- SAME is usually not required.
  Why: design review rarely depends on entity deduplication.
- BAE may be optional.
  Why: some reviews need explanation under uncertainty, but many are governed more by evidence and consistency than probabilistic best-explanation reasoning.

## Learning Order

1. Evidence Weighting
2. Context Reconstruction
3. Design System Rules
4. Advanced Workflow Patterns
5. SAME
6. BAE

## Build Pattern

The agent gathers design evidence, reconstructs intent and constraints, evaluates against reusable rules, and communicates findings in a consistent review format.

## Required Concepts Declaration

- `required_concepts`: Evidence Weighting, Design System Rules, Context Reconstruction
- `optional_concepts`: SAME, BAE, Advanced Workflow Patterns
- `not_needed`: SAME usually
- `why`: design review is primarily about evidence-backed interpretation and communication discipline

## Test

Give the agent a mismatched UI and ask it to identify rule violations, confidence gaps, and the clearest next revision step without inventing a new design language.
