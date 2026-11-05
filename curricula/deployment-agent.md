# Deployment Agent Curriculum

## Goal

Teach an agent to execute deployments through staged workflows while preserving evidence, context, and safe escalation.

## Required Concepts

- Advanced Workflow Patterns
- Evidence Weighting
- Context Reconstruction

## Optional Concepts

- BAE
- SAME
- Design System Rules

## Not Needed

- SAME is likely not needed unless environments, services, or incidents involve ambiguous identity across entities.
- Design System Rules are not core unless the deployment agent also owns reviewer-facing presentation.

## Learning Order

1. Advanced Workflow Patterns
2. Evidence Weighting
3. Context Reconstruction
4. BAE
5. SAME
6. Design System Rules

## Build Pattern

The agent runs a checkpointed workflow, weighs build and runtime evidence, reconstructs what happened if something fails, and selects the next safe step instead of forcing progress.

## Required Concepts Declaration

- `required_concepts`: Advanced Workflow Patterns, Evidence Weighting, Context Reconstruction
- `optional_concepts`: BAE, SAME, Design System Rules
- `not_needed`: SAME usually
- `why`: deployment work is primarily staged execution plus evidence-aware state assessment

## Test

Give the agent mixed deployment signals, one failed prerequisite, and partial context from a previous run. It should stop safely, explain the evidence, and recommend the next workflow step.
