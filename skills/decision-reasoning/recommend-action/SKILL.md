---
name: recommend-action
description: Recommend a proportionate operational response using reconstructed state, relative context, causal explanation, connected context, business impact, historical precedent, policy, approval state, and permitted-action constraints.
---

# Recommend Action

Recommend a proportionate next step without implying authorization or execution.

## Core question

What should we do?

## Standard action classes

- ignore
- monitor
- request_information
- request_review
- escalate
- intervene
- block
- reverse
- remediate

## Responsibilities

- generate feasible response options
- evaluate trade-offs
- prefer proportionate intervention
- consider the no-action option
- distinguish recommendation from authorization
- identify human-review requirements
- define monitoring and reassessment conditions

## Required output

```yaml
action_recommendation:
  recommended_action: string
  confidence: number
  rationale:
    signal: string
    relative_context: string
    cause: string
    connected_context: string
    business_impact: string
    historical_precedent: string
  alternatives:
    - action: string
      advantages: []
      risks: []
      reason_not_preferred: string
  authorization:
    recommendation_only: true
    permitted_by_policy: true | false | unknown
    approval_required: true | false | unknown
    required_approver: string | null
  execution:
    immediate_steps: []
    owner: string | null
    deadline: datetime | null
    monitoring_conditions: []
    reassessment_trigger: string | null
  no_action_option:
    evaluated: true
    likely_result: string
```

## Boundary

This skill recommends action.

Actual execution belongs to a separate permitted-action workflow.
