---
name: document-diff
description: 'Compare document versions and generate a provenance-aware change record. Use for contracts, invoices, policies, specifications, drawings, and regulated documents where users need to know exactly what changed, when, and through which source. Do not compare documents as equivalent if their source or extraction quality prevents a reliable match.

  '
metadata:
  domain: document-intelligence
  risk-level: controlled
  compatibility: Supports native digital files and OCR outputs; OCR-derived comparisons must disclose extraction uncertainty.
---

# Purpose

Produce a defensible difference analysis while preserving both source artifacts, their hashes, and the chain of transformations used to compare them.

## Workflow

1. Confirm the two or more artifact version IDs and designate the baseline.
2. Verify file integrity and capture each version’s hash, source, and observed timestamp.
3. Determine comparison mode: byte-level, structural, textual, table-aware, or semantic.
4. If OCR is involved, compare image regions or source pages for material changes and label uncertain text.
5. Categorize changes as addition, deletion, modification, move, formatting-only, metadata-only, or unresolved.
6. Identify material changes using the user’s defined rules; otherwise label materiality as unassessed.
7. Produce a reversible change log that links every reported change to page, section, field, or record coordinates.
8. Never overwrite the baseline, normalized text, or prior diff results.

## Output format

```yaml
document_diff:
  baseline_artifact_id: "AV-..."
  comparison_artifact_id: "AV-..."
  comparison_method: "textual | structural | semantic | hybrid"
  source_integrity: "verified | mismatch | unavailable"
  changes:
    - change_id: "CH-..."
      category: "addition | deletion | modification | move | formatting | metadata | unresolved"
      location: "page/section/field"
      before: "..."
      after: "..."
      confidence: 0.0
      materiality: "material | nonmaterial | unassessed"
  limitations: []
```

## Guardrails

- Formatting changes can affect meaning in tables, drawings, payment instructions, and signature blocks; do not always dismiss them.
- A semantic summary supplements, but never replaces, an itemized diff for high-risk documents.
- Flag changed banking details, payment terms, approvals, signatures, scope, pricing, addresses, and security requirements for manual review.
