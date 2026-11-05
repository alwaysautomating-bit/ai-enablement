---
name: retrieve-historical-knowledge
description: Retrieve and compare prior events, decisions, interventions, outcomes, exceptions, and lessons that are relevant to the current operational situation.
---

# Retrieve Historical Knowledge

Retrieve relevant precedent without turning precedent into automatic prescription.

## Core question

What happened last time?

## Responsibilities

- retrieve semantically and operationally similar cases
- distinguish superficial similarity from decision-relevant precedent
- compare conditions across cases
- identify prior actions and outcomes
- surface failed as well as successful interventions
- detect recurring patterns

## Required output

```yaml
historical_knowledge:
  similar_cases:
    - case_ref: string
      similarity_basis: []
      important_differences: []
      prior_action: string | null
      outcome: string | null
      lesson: string | null
      relevance: high | medium | low
  recurring_patterns: []
  prior_exceptions: []
  prior_decision_rules: []
  evidence_gaps: []
  historical_summary: string
  confidence: number
```

## Boundary

This skill retrieves precedent and lessons.

It does not assume the prior action is appropriate now.
