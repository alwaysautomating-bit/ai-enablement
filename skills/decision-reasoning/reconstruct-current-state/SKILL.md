---
name: reconstruct-current-state
description: Reconstruct the best-supported current state of an entity, workflow, obligation, or operational situation from fragmented and potentially conflicting evidence. Resolves chronology, supersession, dependencies, and uncertainty before downstream reasoning or action. Use when a user asks what is true now, what changed, what remains unresolved, whether a workflow or entity is ready, or when downstream reasoning needs a defensible current-state packet instead of isolated fields or the newest record.
---

# Reconstruct Current State

Reconstruct the best-supported current state of a target entity, workflow, obligation, or operational situation from fragmented and potentially conflicting evidence.

## Purpose

Operational truth is rarely stored in one place.

The current state of a project, invoice, vendor, approval, contract, risk, or obligation may be distributed across:

- systems of record
- emails
- documents
- chat messages
- workflow events
- approval records
- evidence claims
- human updates
- prior decisions
- external systems

This skill answers:

What is true now?

It does not simply return the newest record.

## Core principle

Current state is derived from evidence.

It is not assumed from:

- the latest timestamp alone
- a single status field
- the most recently uploaded document
- an unverified user statement
- a model-generated summary
- the first matching record
- whichever system was queried first

A reliable reconstruction must distinguish:

- observed facts
- inferred state
- unresolved conflicts
- superseded information
- missing evidence
- time-sensitive assumptions

## Inputs

The skill may receive:

- target entity or situation
- target point in time, defaulting to now
- structured records
- event history
- documents and extracted claims
- approval and review records
- relationships and dependencies
- business rules
- source metadata
- prior state reconstructions
- user-provided context

## Required output

```yaml
target:
  id: string
  type: string
  as_of: datetime

state:
  summary: string
  state_code: string | null
  effective_since: datetime | null
  confidence: high | medium | low

confirmed_facts:
  - fact: string
    value: any
    effective_at: datetime | null
    source_refs: []
    authority: authoritative | corroborating | informational
    confidence: number

inferred_facts:
  - inference: string
    basis: string
    source_refs: []
    confidence: number

superseded_facts:
  - prior_fact: string
    superseded_by: string
    effective_at: datetime | null
    source_refs: []

conflicts:
  - issue: string
    competing_claims: []
    resolution_status: resolved | unresolved
    resolution_basis: string | null

dependencies:
  - dependency: string
    status: satisfied | unsatisfied | unknown
    source_refs: []

open_questions:
  - question: string
    why_it_matters: string
    required_evidence: string | null

provenance:
  source_count: number
  reconstruction_method: string
  generated_at: datetime
```

## Reconstruction procedure

1. Define the target, entity boundary, time boundary, and decision context.
2. Gather candidate evidence from all permitted sources.
3. Normalize identity before combining evidence.
4. Build chronology using both recorded and effective timestamps.
5. Evaluate source authority.
6. Resolve supersession.
7. Resolve or preserve conflicts.
8. Evaluate dependencies.
9. Separate fact from inference.
10. Assign confidence.
11. Produce the reconstruction.

## Decision rules

### Never use latest-wins by default

Recency is one signal, not the governing rule.

Use effective date, authority, approval status, and supersession logic together.

### Preserve bitemporal meaning

Where supported, distinguish:

- when the fact became true
- when the system learned or recorded it

### Prefer reviewed knowledge

Human-reviewed and approved facts outrank unreviewed model extractions unless a higher-authority source proves otherwise.

### Do not invent continuity

A prior state does not remain current when its validity period is unknown or when later evidence suggests change.

### Do not manufacture precision

Use `unknown`, `unresolved`, or a confidence range when evidence does not support a precise answer.

### Do not recommend action

This skill reconstructs state.

It may identify blockers and open questions, but action selection belongs to downstream reasoning, policy, or readiness skills.

## Example

Vendor onboarding may be provisionally incomplete when tax, banking, and sanctions are complete but a replacement insurance certificate has been received without required human review.

## Failure conditions

Return a blocked or low-confidence reconstruction when:

- target identity cannot be resolved
- governing evidence is unavailable
- material sources conflict
- effective dates cannot be established
- required dependencies are unknown
- the requested state exceeds available authorization
- the evidence cannot support a defensible conclusion

## Integration

This skill can consume outputs from:

- identity-resolution skills
- document parsing and extraction
- evidence validation
- operational memory retrieval
- event-history retrieval
- dependency graph traversal
- policy lookup

Its output can support:

- `classify-approval-status`
- payment readiness
- vendor readiness
- project boundary evaluation
- risk classification
- historical comparison
- anomaly interpretation
- escalation decisions
- context-to-decision reasoning workflows

## Success criteria

A successful reconstruction allows another person or system to answer:

- What is true now?
- Since when?
- Based on which evidence?
- What changed?
- What was superseded?
- What remains uncertain?
- Which dependencies remain unresolved?
- How confident should we be?
