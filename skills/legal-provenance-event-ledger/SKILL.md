---
name: legal-provenance-event-ledger
description: >-
  Store provenance events in a tamper-evident, append-only ledger suitable for audit, investigation, and defensible reconstruction.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Maintain an immutable event ledger

### Goal
Store provenance events in a tamper-evident, append-only ledger suitable for audit, investigation, and defensible reconstruction.

### Event schema

```yaml
event_id: EVT-2026-0000001
matter_id: MAT-2026-001
event_type: evidence_intake | custody_transfer | authentication_review | evidence_offer | objection | ruling | discussion | derivation | access | export | correction
occurred_at: "2026-08-17T20:20:00Z"
recorded_at: "2026-08-17T20:20:08Z"
actor_id: AG-0007
subject_ids:
  - EV-2026-000184
  - REP-2026-000184-01
payload_hash: "<digest>"
previous_event_hash: "<digest-or-null>"
event_hash: "<digest>"
signature: "<optional detached signature>"
source_record_ids:
  - REP-2026-000184-01-intake-receipt
classification: confidential
```

### Required behavior

- Hash canonicalized event payloads.
- Chain events within a matter or evidence stream using `previous_event_hash`.
- Retain correction events rather than changing prior payloads.
- Store an export manifest and graph snapshot hash whenever a dossier or production is generated.
- Log access, export, and redaction actions as provenance activities.
- Keep `occurred_at`, record/proceeding position, and corpus acquisition sequence distinct. If their relationship is incomplete or disputed, invoke `reconstruct-partial-event-order` and retain the supported ordering edges rather than forcing a single chronology.

---
## Legal-use guardrails

- Preserve records and provenance without deciding admissibility, authenticity, credibility, relevance, privilege, or legal sufficiency.
- Require authorized legal review for jurisdiction-specific evidentiary determinations.
- Keep analysis, party argument, witness testimony, technical validation, and court rulings distinct.
- Avoid automated truth labels for disputed evidence; preserve traceable assertions, uncertainty, and gaps.
- Retain original language, artifacts, and source locations for independent inspection.

## Source provenance

Adapted from [Legal Evidence Provenance Skills](../../references/source-material/legal-evidence-provenance-skills.md). The source document remains evidence; this skill is the callable procedure.
