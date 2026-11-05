---
name: classify-operational-event-type
description: Classify a candidate operational event into the best-fitting event type while preserving ambiguity, provenance, and uncertainty. Use after event detection when a candidate state transition exists and the system must distinguish decisions, approvals, commitments, blockers, status changes, payments, deliveries, incidents, corrections, or other operational event types without overclaiming certainty.
---

# Classify Operational Event Type

Assign the most decision-useful event type to a candidate operational event.

## Core question

What kind of operational event is this?

## Responsibilities

- classify the primary event type
- preserve alternate plausible types
- explain why the chosen type fits best
- reject superficial matches
- preserve uncertainty when the evidence is mixed

## Output

```yaml
event_type_classification:
  primary_type: ""
  alternate_types: []
  rationale: ""
  confidence: 0.0
  rejected_types: []
```

## Boundary

This skill names the event type.

It does not reconstruct full current state or decide business significance.
