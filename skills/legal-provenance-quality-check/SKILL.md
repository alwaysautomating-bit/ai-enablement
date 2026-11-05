---
name: legal-provenance-quality-check
description: >-
  Find missing links, integrity anomalies, ambiguous identity mappings, and material contradictions before producing a legal-facing report.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Detect provenance gaps and contradictions

### Goal
Find missing links, integrity anomalies, ambiguous identity mappings, and material contradictions before producing a legal-facing report.

### Checks

- Evidence representation has no hash, or hash algorithm is absent.
- A custody transfer lacks sender, recipient, time, acknowledgement, or authority.
- A time gap exists between custody events without a recorded storage or possession event.
- A derivative has no identified source representation or processing activity.
- A court disposition exists with no linked offer or authority source.
- An assertion lacks speaker, source locator, date, or capacity.
- A summary exists without a source artifact.
- Exhibit number maps to multiple representations without a proceeding-specific mapping.
- A redacted derivative is used without documenting redaction authority and source.
- A claim of admission conflicts with a recorded exclusion or limited-admission ruling.
- A hash changes during a claimed bit-for-bit transfer.

### Severity model

| Severity | Meaning | Example |
|---|---|---|
| `critical` | Integrity or identity issue that can undermine reliance | Hash mismatch after transfer |
| `high` | Material missing provenance or unresolved court status | Claimed admission without order or transcript citation |
| `medium` | Incomplete documentation requiring qualification | Recipient acknowledgement missing |
| `low` | Metadata or usability issue | Missing normalized summary |

### Output

```yaml
finding_id: QC-2026-00017
severity: high
subject_id: REP-2026-000184-02
rule: court_disposition_missing_authority
finding: "Admission status is recorded without a transcript, order, or minute entry locator."
recommended_action: "Attach a source representation and precise proceeding locator; do not state admission as verified until then."
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
