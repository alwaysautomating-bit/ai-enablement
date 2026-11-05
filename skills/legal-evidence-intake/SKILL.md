---
name: legal-evidence-intake
description: >-
  Create the initial provenance record for an item received from a person, repository, production, device, agency, or court filing.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Register evidence at intake

### Goal
Create the initial provenance record for an item received from a person, repository, production, device, agency, or court filing.

### Inputs

```yaml
evidence_id: EV-2026-000184
matter_id: MAT-2026-001
item_type: digital_file | physical_object | testimony_record | court_record | mixed
received_from:
  agent_id: AG-0042
  name: "Example Producing Party"
  capacity: producing_party
received_at: "2026-08-17T20:20:00Z"
received_method: secure_portal
source_description: "Native email export produced in response to request 12"
original_filename: "invoice-thread.msg"
mime_type: application/vnd.ms-outlook
byte_size: 182736
hash:
  algorithm: SHA-256
  value: "<digest>"
storage_uri: "immutable://matter/MAT-2026-001/EV-2026-000184/raw"
operator:
  agent_id: AG-0007
  name: "Records Custodian"
notes: "Timestamp embedded in file has not yet been independently verified."
```

### Required behavior

1. Create a `leg:EvidenceItem` for the conceptual item.
2. Create a `leg:EvidenceRepresentation` for the received artifact.
3. Create an `leg:Acquisition` activity.
4. Associate the intake operator and source/producing agent with their roles.
5. Preserve the source description verbatim as a source-attributed assertion.
6. Record hashes and storage details without treating the hash as proof of authorship or authenticity.
7. Mark unverified facts as unverified.

### Output

- Stable item and representation identifiers.
- An intake activity ID.
- A PROV graph fragment.
- A machine-readable integrity receipt.
- A human-readable chain-of-custody entry.

### Example PROV

```turtle
case:EV-2026-000184 a leg:EvidenceItem ;
  leg:hasEvidenceId "EV-2026-000184" ;
  dct:description "Native email export produced in response to request 12" ;
  leg:hasCustodyStatus "received" .

case:REP-2026-000184-01 a leg:EvidenceRepresentation ;
  prov:specializationOf case:EV-2026-000184 ;
  dct:format "application/vnd.ms-outlook" ;
  leg:hasContentHash "<digest>" ;
  leg:hashAlgorithm "SHA-256" ;
  leg:hasStorageLocation "immutable://matter/MAT-2026-001/EV-2026-000184/raw" ;
  prov:wasGeneratedBy case:ACT-intake-000184 .

case:ACT-intake-000184 a leg:Acquisition ;
  prov:endedAtTime "2026-08-17T20:20:00Z"^^xsd:dateTime ;
  prov:wasAssociatedWith case:AG-0007 ;
  prov:used case:AG-0042 ;
  leg:hasRole "intake_operator" .

case:ASRT-source-description-000184 a leg:Assertion ;
  leg:assertsAbout case:EV-2026-000184 ;
  leg:assertsPredicate "source_description" ;
  leg:assertsObject "Native email export produced in response to request 12" ;
  leg:assertionType "production_description" ;
  leg:assertionStatus "asserted" ;
  prov:wasAttributedTo case:AG-0042 .
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
