---
name: legal-evidence-discussion-log
description: >-
  Create a structured record of who discussed an item, what they said, in what capacity, and where the statement can be verified.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Track discussion, testimony, and objections

### Goal
Create a structured record of who discussed an item, what they said, in what capacity, and where the statement can be verified.

### Inputs

```yaml
discussion_id: DISC-2026-000126
representation_id: REP-2026-000184-02
speaker:
  agent_id: AG-0021
  name: "Witness A"
  capacity: fact_witness
context:
  event_type: deposition | hearing | trial | meeting | correspondence | expert_report
  proceeding_id: DEPO-2026-0009
  transcript_reference: "54:11-55:7"
  source_representation_id: REP-transcript-0009-01
occurred_at: "2026-08-20T19:47:00Z"
role: authenticated | described | denied_authorship | explained_context | objected | argued | interpreted
verbatim_text: "I recognize this as the invoice email I received."
normalized_summary: "Witness stated that they recognized the email as an invoice email they received."
assertions_created:
  - ASRT-2026-000211
```

### Required behavior

- Preserve verbatim language and source locators whenever possible.
- Separate a transcript quote from a system-generated summary.
- Tag the speaker’s role and capacity at the time of the statement.
- Track objections separately from rulings.
- Store an unavailable/uncertain transcription as uncertain; do not convert it into a definitive statement.

### Objection model

```yaml
objection:
  asserted_by: AG-0014
  ground: hearsay
  occurred_at: "2026-08-21T16:13:00Z"
  transcript_reference: "Tr. 146:4"
  ruling: sustained | overruled | reserved | not_recorded
  ruling_reference: "Tr. 146:5"
```

---
## Legal-use guardrails

- Preserve records and provenance without deciding admissibility, authenticity, credibility, relevance, privilege, or legal sufficiency.
- Require authorized legal review for jurisdiction-specific evidentiary determinations.
- Keep analysis, party argument, witness testimony, technical validation, and court rulings distinct.
- Avoid automated truth labels for disputed evidence; preserve traceable assertions, uncertainty, and gaps.
- Retain original language, artifacts, and source locations for independent inspection.

## Source provenance

Adapted from [Legal Evidence Provenance Skills](../../references/source-material/legal-evidence-provenance-skills.md). The source document remains evidence; this skill is the callable procedure.
