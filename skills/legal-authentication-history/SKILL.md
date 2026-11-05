---
name: legal-authentication-history
description: >-
  Capture each authentication-related test, foundation witness statement, metadata review, system validation, hash comparison, stipulation, challenge, and court decision.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Record authentication history

### Goal
Capture each authentication-related test, foundation witness statement, metadata review, system validation, hash comparison, stipulation, challenge, and court decision.

### Inputs

```yaml
authentication_event_id: AUTH-2026-000044
representation_id: REP-2026-000184-01
review_type: hash_verification | metadata_review | witness_foundation | system_record_review | forensic_validation | stipulation | challenge
performed_by:
  agent_id: AG-0033
  name: "Forensic Examiner"
  capacity: retained_expert
performed_at: "2026-08-18T14:05:00Z"
method: "SHA-256 comparison against intake digest"
inputs_used:
  - REP-2026-000184-01
result: match
result_summary: "Received artifact matches the intake hash."
limitations:
  - "Hash match establishes file identity relative to intake, not original authorship."
supporting_records:
  - REP-2026-000184-01
  - REP-2026-000184-01-intake-receipt
```

### Required behavior

- Preserve the exact method, tool name, version, settings, examiner, input artifacts, and output artifacts.
- Distinguish identity/integrity verification from authorship, accuracy, completeness, reliability, and admissibility.
- Capture limitations and challenges as first-class records.
- Link opinions to their underlying record set; do not allow a conclusion without traceable support.

### Authentication status model

| Status | Meaning |
|---|---|
| `not_reviewed` | No authentication activity recorded |
| `integrity_checked` | Identity/integrity check completed |
| `foundation_offered` | A party has offered foundation evidence |
| `authentication_contested` | One or more parties challenged authentication |
| `stipulated` | Parties agreed to an identified scope |
| `court_accepted` | Court accepted authentication for a stated purpose or scope |
| `court_rejected` | Court rejected authentication for a stated purpose or scope |

---
## Legal-use guardrails

- Preserve records and provenance without deciding admissibility, authenticity, credibility, relevance, privilege, or legal sufficiency.
- Require authorized legal review for jurisdiction-specific evidentiary determinations.
- Keep analysis, party argument, witness testimony, technical validation, and court rulings distinct.
- Avoid automated truth labels for disputed evidence; preserve traceable assertions, uncertainty, and gaps.
- Retain original language, artifacts, and source locations for independent inspection.

## Source provenance

Adapted from [Legal Evidence Provenance Skills](../../references/source-material/legal-evidence-provenance-skills.md). The source document remains evidence; this skill is the callable procedure.
