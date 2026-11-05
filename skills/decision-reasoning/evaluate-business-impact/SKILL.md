---
name: evaluate-business-impact
description: Evaluate whether an operational signal or reconstructed situation materially affects defined objectives, commitments, customers, finances, risk tolerances, compliance duties, or operating boundaries.
---

# Evaluate Business Impact

Determine whether the situation materially matters.

## Core question

Does it matter?

## Responsibilities

- connect the event to explicit objectives
- estimate consequence and urgency
- distinguish local variance from material impact
- evaluate impact if no action is taken
- identify affected stakeholders
- classify reversibility and time sensitivity

## Required output

```yaml
business_impact:
  materiality: none | low | moderate | high | critical | indeterminate
  urgency: none | routine | time_sensitive | immediate
  affected_objectives:
    - objective: string
      impact: positive | negative | mixed | none
      magnitude: string
      evidence: []
  affected_dimensions:
    customer: string | null
    financial: string | null
    operational: string | null
    compliance: string | null
    reputational: string | null
    safety: string | null
  no_action_scenario:
    likely_outcome: string
    time_horizon: string
    confidence: number
  rationale: string
  confidence: number
```

## Boundary

This skill determines significance.

It does not select or authorize the response.
