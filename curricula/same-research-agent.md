# SAME Research Agent Curriculum

## Goal

Teach a set of cooperating agents to run most of the SAME offline research workflow while keeping the human reviewer as the final authority.

## Required Concepts

- SAME
- Evidence Weighting
- BAE
- Context Reconstruction
- Advanced Workflow Patterns

## Optional Concepts

- Design System Rules

## Not Needed

- Design System Rules are not required for the research logic itself.
  Why: SAME research is mostly reasoning and evaluation, though communication rules help with reports and review packets.

## Learning Order

1. SAME
2. Evidence Weighting
3. BAE
4. Context Reconstruction
5. Advanced Workflow Patterns
6. Design System Rules

## Agent Set

- SAME Research Orchestrator
- Training Signal Auditor
- Hard Case Curator
- SAME Feature Analyst
- Deterministic Weight Reviewer
- SAME Experiment Reporter
- Human Review Operator

## Build Pattern

The orchestrator runs the staged pipeline, specialists handle each analytic step, and the human reviewer approves every irreversible or trust-critical decision.

## Human Checkpoints

1. dataset sufficiency
2. hard-case labels
3. deterministic weight changes
4. permission to run model experiment
5. final interpretation of results

## Deliverables

- training-signals-export.json
- baseline-evaluation.json
- same-feature-set.json
- feature-analysis.json
- model decision log updates
- same-report.json

## Review Discipline

Every stage should produce a packet small enough for a human to approve quickly:

- what changed
- what evidence supports it
- what is still uncertain
- what specific decision is needed

## Test

Use [lab-002-same-research-pipeline.md](/evaluations/same-research/scenarios/lab-002.md) and the [same-research-readiness-eval.md](/evaluations/same-research/rubric.md) checklist.
