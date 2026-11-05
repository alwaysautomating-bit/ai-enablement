---
id: reference.operational-event-schema
type: reference
title: Operational Event Schema
description: Minimal portable schema for candidate, confirmed, and rejected operational events.
tags: [pork, schema, operational-events]
portable: true
status: canonical-draft
---

# Operational Event Schema

## Goal

Represent a possible operational state change in a format that humans and agents can both inspect.

## Minimal Shape

```yaml
---
event_id: OE-2026-001
event_type: vendor_selection
project_id: project-riverside
status: candidate
occurred_at: 2026-08-04T14:32:00
effective_at: 2026-08-04T14:32:00

subject:
  entity_type: procurement_package
  entity_id: facade-package

state_transition:
  from:
    selected_vendor: vendor-a
  to:
    selected_vendor: vendor-b

decision:
  summary: Use Vendor B to protect the October milestone.
  authority:
    person: project-executive
    role: project_executive
  approval_status: approved

reason:
  summary: Vendor A lead time would miss the required milestone.

impacts:
  - domain: procurement
    change: Release package to Vendor B.
  - domain: schedule
    change: Protect October dry-in milestone.
  - domain: budget
    change: Add provisional increase of 62000.

open_items:
  - Obtain revised Vendor B quote.
  - Update procurement log.
  - Confirm contract amendment requirement.

provenance:
  source_type: slack
  source_ids:
    - slack-message-101
    - slack-message-104
    - slack-message-107
  source_thread_id: slack-thread-22

confidence:
  event_detection: 0.94
  approval_interpretation: 0.89

review:
  status: pending
  reviewed_by:
  reviewed_at:
---
```

## Required Fields

- `event_id`
- `event_type`
- `status`
- `subject`
- `state_transition`
- `decision`
- `provenance`
- `review`

## Recommended Fields

- `project_id`
- `occurred_at`
- `effective_at`
- `reason`
- `impacts`
- `open_items`
- `confidence`

## Status Rules

- `candidate`
  Evidence suggests a meaningful state change, but the event is not yet trusted as operational truth.
- `confirmed`
  Human review or authoritative process has accepted the event as trusted operational state.
- `rejected`
  Review found that the event did not represent a trusted state change.

## Design Rules

- Preserve the difference between proposal, approval, rejection, and execution.
- Record the state before and after whenever possible.
- Preserve open items instead of implying completion.
- Preserve provisional numbers as provisional.
- Cite the exact sources that support the event.
- Do not force certainty when the evidence is partial.
