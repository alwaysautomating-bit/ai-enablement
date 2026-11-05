# Context Capture Agent Curriculum

## Goal

Prove on synthetic data that the Context Capture capability produces grounded, stabilized, permission-respecting candidate context and never represents a candidate as confirmed before human review.

## Required concepts

- [Evidence Grounding](/knowledge/evidence/evidence-grounding.md)
- [Fact versus Inference](/knowledge/evidence/fact-versus-inference.md)
- [Operational State](/knowledge/operational-state/operational-state.md)
- [Semantic Stabilization Boundary](/knowledge/operational-state/semantic-stabilization-boundary.md)
- [Permission Classes and Scoped Approval](/knowledge/governance/permission-classes.md)

## Learning order

1. Communication is not confirmation.
2. Communication time is not operational time.
3. A persistent entity plus an activity is not a new entity.
4. Derived information cannot escape the visibility of its evidence.
5. Passing one permission class authorizes nothing else.

## Test

- Evaluation: [Synthetic Cross-Channel AP Corpus](/evaluations/context-capture/end-to-end/turner-ap.yaml)
- Fixture owner: SAME, `fixtures/context-capture/turner-ap/`, referenced by path and hash rather than copied into PORK.
- Runtime: AI Enablement Workspace fixture-only school sandbox.

## Graduation

A capability version may use live sources only after a human approval identifies the exact PORK revision, content hash, and granted permission classes. Confirmation and visibility widening remain human-only.
