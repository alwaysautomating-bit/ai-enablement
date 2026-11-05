---
name: provenance-intake
description: 'Intake a document, record, or event into PROV with a verifiable provenance record. Use when a user uploads, submits, imports, receives, or references source material that must be traceable through later extraction, review, and decision workflows. Do not use for ordinary brainstorming or content that does not require an evidentiary record.

  '
metadata:
  domain: provenance
  risk-level: high-integrity
  compatibility: Requires access to the PROV data store or an approved local staging area. Never silently discard source files or metadata.
---

# Purpose

Create an immutable intake record before interpreting or transforming source material. Treat the original source as evidence, not merely input text.

## Required inputs

Collect, infer, or explicitly mark as unknown:

- Source file, URL, message, API payload, or physical-document scan
- Source type and claimed origin
- Acquisition method and timestamp
- Submitting actor or system identity, when available
- Matter, project, vendor, contract, asset, or case association
- Confidentiality classification and retention requirement

## Workflow

1. Preserve the original artifact byte-for-byte where the platform permits it.
2. Calculate and store a cryptographic content hash. Do not overwrite a prior hash.
3. Assign a stable `evidence_id` and a separate `artifact_version_id`.
4. Capture observable source metadata exactly as received. Keep claimed metadata separate from system-observed metadata.
5. Create an intake event containing actor, action, timestamp, source channel, hash, and correlation ID.
6. Classify the artifact only to the confidence justified by the evidence. Use `unknown` rather than inventing a source, document type, or owner.
7. Attach the artifact to its business context, but preserve a many-to-many relationship when context is uncertain or contested.
8. Return a concise intake receipt with identifiers, status, and unresolved questions.

## Integrity rules

- Never replace the original with OCR, extracted text, a normalized copy, or a redacted copy.
- Store derived artifacts as new objects linked to the source artifact.
- Record time as ISO 8601 with timezone. Distinguish `claimed_at`, `observed_at`, and `recorded_at`.
- Do not state that a document is authentic solely because it was uploaded or hashed. A hash proves consistency of a captured artifact, not real-world truth.
- Flag unreadable, incomplete, password-protected, or corrupted artifacts as exceptions.

## Output format

Return:

```yaml
intake_receipt:
  evidence_id: "EV-..."
  artifact_version_id: "AV-..."
  source_hash: "sha256:..."
  intake_status: "accepted | quarantined | needs-review"
  observed_at: "YYYY-MM-DDTHH:MM:SS±HH:MM"
  associated_context: []
  unresolved_items: []
```

## Example

A vendor invoice arrives through email. Preserve the raw email and attachment separately, hash both, record the sender address as an observed attribute, record the claimed vendor name from the invoice as a claim, and link later OCR/extraction output as derived artifacts.
