---
name: provenance-data-model
description: 'Design or review a PROV-compatible data model for artifacts, events, transformations, identities, decisions, attestations, and audit trails. Use when building a provenance layer in Supabase, PostgreSQL, APIs, document pipelines, or event-sourced systems. Do not use a mutable current-state table as the only record for decisions that require traceability.

  '
metadata:
  domain: architecture
  risk-level: high-integrity
  compatibility: PostgreSQL/Supabase-friendly; adaptable to event stores and object storage.
---

# Purpose

Build a durable provenance substrate in which current state is queryable but historical evidence remains attributable, ordered, and tamper-evident.

## Design principles

- Use immutable IDs for artifacts, events, activities, agents, and assertions.
- Keep source artifacts immutable; create new versions and derived objects rather than updates-in-place.
- Model provenance relationships explicitly: `used`, `generated`, `wasDerivedFrom`, `wasAssociatedWith`, `wasAttributedTo`, and `wasInformedBy`.
- Separate business facts, claimed facts, extracted facts, inferred facts, and reviewer-validated facts.
- Store hashes, timestamps, actor identity, tool/model version, configuration version, and correlation IDs at activity boundaries.
- Support soft deletion for application views while retaining compliant evidentiary history under retention policy.
- Store record order, alleged occurrence time, and information-acquisition order as distinct fields or relations. Preserve temporal precision and raw assertions; do not use a single timestamp column to stand in for all three.

## Minimum relational tables

```text
artifacts
artifact_versions
artifact_hashes
activities
agents
activity_agents
derivations
assertions
assertion_evidence
attestations
events
exceptions
retention_holds
access_events
```

## Event record requirements

```yaml
event:
  event_id: "uuid"
  event_type: "artifact.ingested"
  occurred_at: "ISO-8601"
  recorded_at: "ISO-8601"
  actor_id: "agent/person/system ID"
  subject_type: "artifact"
  subject_id: "uuid"
  correlation_id: "uuid"
  idempotency_key: "string"
  prior_event_hash: "sha256:..."
  event_hash: "sha256:..."
  payload_version: 1
  payload: {}
```

## Implementation workflow

1. Identify the business objects and critical decisions that need lineage.
2. Define immutable source-of-truth tables before building derived views.
3. Specify event types and permitted state transitions.
4. Add database constraints for identity, foreign keys, hash format, and append-only behavior.
5. Implement idempotency and correlation IDs for every intake and workflow action.
6. Create queryable current-state projections from the event stream; never make the projection the sole evidence record.
7. Test for replay, duplicate delivery, partial failures, correction events, and actor attribution.
8. Document retention, redaction, access control, export, and legal-hold behavior.

Use `reconstruct-partial-event-order` when the event history is incomplete, conflicting, or only relatively ordered.

## Review checklist

- Can a reviewer trace a decision to exact source artifacts?
- Can the system distinguish original, normalized, extracted, and inferred content?
- Can a correction be made without erasing the prior record?
- Can an event be tied to a responsible human or system agent?
- Can the system explain what model/configuration created an AI-derived output?
- Can high-risk records be retained and exported with integrity metadata?
