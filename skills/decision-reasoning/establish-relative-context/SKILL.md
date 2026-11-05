---
name: establish-relative-context
description: Compare a current signal or reconstructed state against relevant baselines, expectations, peers, seasonality, plans, and normal operating ranges to determine whether it is unusual and in what way.
---

# Establish Relative Context

Determine whether a signal or state is genuinely unusual.

## Core question

Relative to what?

## Responsibilities

- identify valid comparison sets
- reject misleading baselines
- distinguish absolute change from unusual change
- calculate or describe variance
- identify seasonality and recurring patterns
- preserve multiple relevant baselines

## Required output

```yaml
comparison:
  observed_value: any
  baselines:
    - baseline_type: historical | seasonal | planned | peer | policy | statistical
      baseline_value: any
      comparison_result: string
      variance: number | null
      source_refs: []
      relevance: high | medium | low
  overall_assessment:
    classification: expected | unusual | materially_unusual | indeterminate
    rationale: string
    confidence: number
  missing_comparisons: []
  misleading_comparisons_rejected: []
```

## Boundary

This skill determines whether the signal is unusual.

It does not explain the cause or determine business importance.
