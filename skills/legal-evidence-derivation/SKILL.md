---
name: legal-evidence-derivation
description: >-
  Show exactly how a representation was created from another representation, including exports, OCR, transcription, redaction, parsing, forensic extraction, format conversion, annotation, and demonstrative preparation.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Trace transformations and derivatives

### Goal
Show exactly how a representation was created from another representation, including exports, OCR, transcription, redaction, parsing, forensic extraction, format conversion, annotation, and demonstrative preparation.

### Inputs

```yaml
derivation_activity_id: DERIVE-2026-000055
source_representation_id: REP-2026-000184-01
output_representation_id: REP-2026-000184-02
transformation_type: OCR | transcription | redaction | export | forensic_extraction | format_conversion | excerpt | annotation
performed_by: AG-0033
performed_at: "2026-08-18T15:30:00Z"
tool:
  name: "Example OCR Tool"
  version: "5.4.1"
  configuration_hash: "<digest>"
method_summary: "OCR applied to image-only PDF; original preserved."
quality_checks:
  - "Spot check completed against pages 1-10."
limitations:
  - "OCR output may contain transcription errors."
```

### Required behavior

- Use `prov:wasDerivedFrom` and a derivation activity for every material transformation.
- Keep the source artifact immutable and independently accessible to authorized users.
- Preserve tool version and configuration for repeatability.
- Mark whether the derivative is a faithful copy, a lossy conversion, a redaction, an analytical output, or a demonstrative.
- Never present an AI-generated summary, OCR text, or extracted metadata as the original record.

---
## Legal-use guardrails

- Preserve records and provenance without deciding admissibility, authenticity, credibility, relevance, privilege, or legal sufficiency.
- Require authorized legal review for jurisdiction-specific evidentiary determinations.
- Keep analysis, party argument, witness testimony, technical validation, and court rulings distinct.
- Avoid automated truth labels for disputed evidence; preserve traceable assertions, uncertainty, and gaps.
- Retain original language, artifacts, and source locations for independent inspection.

## Source provenance

Adapted from [Legal Evidence Provenance Skills](../../references/source-material/legal-evidence-provenance-skills.md). The source document remains evidence; this skill is the callable procedure.
