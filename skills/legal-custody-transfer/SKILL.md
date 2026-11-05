---
name: legal-custody-transfer
description: >-
  Record every transfer, temporary possession, storage move, checkout, return, or controlled access event affecting an evidence item or representation.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Record chain of custody

### Goal
Record every transfer, temporary possession, storage move, checkout, return, or controlled access event affecting an evidence item or representation.

### Inputs

```yaml
transfer_id: CUST-2026-000091
representation_id: REP-2026-000184-01
from_agent:
  agent_id: AG-0007
  role: evidence_custodian
to_agent:
  agent_id: AG-0033
  role: forensic_examiner
handoff_at: "2026-08-17T22:30:00Z"
received_at: "2026-08-17T22:34:00Z"
transfer_method: encrypted_media | secure_download | physical_handoff | courier
location_from: "Evidence vault A"
location_to: "Forensics lab"
condition_out: "sealed; hash verified"
condition_in: "sealed; hash verified"
verification:
  algorithm: SHA-256
  expected_digest: "<digest>"
  observed_digest: "<digest>"
  result: match
authority: "Matter preservation protocol v2.1"
```

### Required behavior

- Create a custody transfer activity, not merely a mutable status update.
- Capture both sender and recipient acknowledgement when available.
- Record any hash mismatch, broken seal, delay, missing receipt, or unknown custodian as an exception.
- Do not silently infer continuous custody across gaps.
- Generate a continuity assessment: `continuous`, `documented_gap`, `integrity_exception`, or `unknown`.

### Output fields

```yaml
continuity_assessment: continuous
exceptions: []
next_custodian: AG-0033
representation_hash_verified: true
```

### Example PROV

```turtle
case:CUST-2026-000091 a leg:CustodyTransfer ;
  prov:used case:REP-2026-000184-01 ;
  prov:wasAssociatedWith case:AG-0007, case:AG-0033 ;
  prov:startedAtTime "2026-08-17T22:30:00Z"^^xsd:dateTime ;
  prov:endedAtTime "2026-08-17T22:34:00Z"^^xsd:dateTime ;
  leg:hasAuthority "Matter preservation protocol v2.1" ;
  leg:verificationResult "match" .
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
