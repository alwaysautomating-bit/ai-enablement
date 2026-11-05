---
name: evidence-chain
description: 'Build, inspect, and explain a chain of custody and transformation lineage for PROV evidence. Use when users need to know where a record came from, who handled it, what transformations occurred, or whether an output can be traced to source material. Do not use to claim legal admissibility or authenticity without jurisdiction-specific review.

  '
metadata:
  domain: provenance
  risk-level: high-integrity
  compatibility: Requires immutable or append-only event records and artifact identifiers.
---

# Purpose

Represent evidence as a directed lineage graph: source artifacts, derived artifacts, activities, agents, decisions, and attestations.

## Core entities

- `entity`: a file, record, extracted value, report, or decision output
- `activity`: ingest, OCR, parse, classify, approve, export, or correction
- `agent`: person, service account, application, model, or external system
- `assertion`: a claim about an entity, distinct from the entity itself
- `attestation`: a signed or attributable statement of review or approval

## Workflow

1. Start with the exact entity or decision the user asks about.
2. Traverse backward to every immediate input, then recursively to original sources.
3. For every edge, identify the activity that produced the downstream entity.
4. For every activity, identify the acting agent, time window, tool or model version, configuration, and correlation ID when known.
5. Separate deterministic transformations from AI-assisted transformations.
6. Surface broken links, missing timestamps, altered hashes, unidentified agents, and unexplained version changes.
7. Produce both a human-readable timeline and a machine-readable graph payload.

When the history is incomplete or timestamps conflict, use `reconstruct-partial-event-order`. Keep record order, occurrence time, and information-acquisition order separate; a lineage edge may constrain information flow without proving real-world chronology.

## Required distinctions

- “Derived from” is not the same as “verified against.”
- “Reviewed” is not the same as “approved.”
- “User supplied” is not the same as “source independently verified.”
- A model-generated extraction is a claim until validated or otherwise designated by policy.

## Output format

```yaml
lineage_summary:
  subject_entity_id: "..."
  lineage_status: "complete | partial | broken"
  root_sources: []
  transformations: []
  human_reviews: []
  integrity_findings: []
  limitations: []
```

## Quality bar

Use exact IDs and timestamps where available. If a link is inferred rather than recorded, label it `inferred` and explain the basis. Never silently bridge a missing event.
