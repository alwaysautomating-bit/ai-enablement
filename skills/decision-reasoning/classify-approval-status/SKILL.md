---
name: classify-approval-status
description: Determine the defensible approval state of an entity, request, workflow, or proposed action by distinguishing approval from readiness, completion, recommendation, or permission. Use whenever a user asks whether something is approved, can proceed, who approved it, whether a status marked approved is actually valid, or whether scope, authority, validity, dependencies, or policy conditions prevent action.
---

# Classify Approval Status

Determine the defensible approval state of a target object under the current policy, scope, authority, and dependency conditions.

## Purpose

Approval is frequently reduced to `approved = true`.

Real operational approval is often more complex:

- complete but not approved
- approved but no longer valid
- approved for one purpose but not another
- conditionally approved
- ready but awaiting authority
- approved by the wrong person
- approved and later revoked
- recommended by AI but never reviewed
- approved while required dependencies remain unresolved

This skill answers:

Has the required authority validly approved this specific thing, for this specific purpose, under the current conditions?

## Core principle

Approval is a governed decision.

It is distinct from:

- completion
- readiness
- recommendation
- acknowledgment
- review
- confidence
- system status
- model output
- permission to execute

An AI-generated conclusion must never be treated as human approval unless policy explicitly authorizes automated approval for that decision class.

## Inputs

Gather what is available and use `indeterminate` when required inputs are missing:

- target entity, request, or proposed action with exact scope
- reconstructed current state
- requested approval scope
- applicable approval policy
- required approver role or authority
- approval records
- conditions and dependencies
- validity periods
- revocations or superseding decisions
- evidence provenance
- organizational or project boundaries
- risk classification

## Approval status taxonomy

- `not_required`
- `not_submitted`
- `pending_review`
- `more_information_required`
- `conditionally_approved`
- `approved`
- `partially_approved`
- `rejected`
- `expired`
- `revoked`
- `superseded`
- `disputed`
- `indeterminate`

## Required output

```yaml
target:
  id: string
  type: string
  requested_scope: string
  as_of: datetime

classification:
  approval_status: string
  effective: true | false | unknown
  confidence: high | medium | low
  action_permission:
    permitted
    permitted_with_conditions
    review_required
    blocked
    unknown

approval_basis:
  policy_refs: []
  approval_records: []
  authorized_role: string | null
  actual_approver: string | null
  authority_valid: true | false | unknown
  approved_scope: string | null
  effective_at: datetime | null
  expires_at: datetime | null

conditions:
  satisfied: []
  unsatisfied: []
  unknown: []

dependencies:
  - requirement: string
    status: satisfied | unsatisfied | unknown
    source_refs: []

conflicts:
  - issue: string
    materiality: material | non_material
    source_refs: []

reason:
  summary: string
  blocking_reasons: []
  next_required_step: string | null

provenance:
  source_refs: []
  classified_at: datetime
```

## Classification procedure

1. Define the approval object and exact scope.
2. Reconstruct current state rather than trusting isolated fields.
3. Identify the applicable policy and its version.
4. Identify the required authority and validate delegation, threshold, and duty separation.
5. Find real approval events and exclude comments, recommendations, drafts, and model output.
6. Validate scope match.
7. Validate effective status.
8. Evaluate conditions and dependencies.
9. Detect conflicts.
10. Select the narrowest defensible classification.
11. Determine action permission separately from approval status.
12. Explain the classification with evidence and next step.

## Decision rules

- approval must be explicit
- scope must match
- authority must be valid
- material changes trigger re-evaluation
- approval and readiness stay separate
- human review must be preserved
- negative decisions persist until validly superseded

## Action permission

Use:

- `permitted`
- `permitted_with_conditions`
- `review_required`
- `blocked`
- `unknown`

Approval may remain `approved` while `action_permission` is `blocked` because dependencies are unresolved.

## Example interpretation

Budget-owner approval for an invoice may still leave payment blocked if finance approval is required above threshold and remains pending.

## Failure conditions

Return `indeterminate`, `disputed`, or `blocked` when:

- policy cannot be identified
- entity or version identity is uncertain
- approver authority cannot be validated
- approval scope is ambiguous
- material conflicts remain unresolved
- evidence provenance is unavailable
- a required dependency has unknown status
- the request attempts to infer human approval from AI output

## Relationship to permitted actions

This skill classifies approval.

A separate policy or action-control layer makes the final enforcement decision:

```text
current state
    ->
approval classification
    ->
readiness and risk evaluation
    ->
permitted-action policy
    ->
execute, request review, escalate, or block
```

## Boundary

This skill determines approval status and action permission classification.

It does not execute, approve, or authorize the action itself.
