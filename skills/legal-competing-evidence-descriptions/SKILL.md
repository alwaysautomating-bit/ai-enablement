---
name: legal-competing-evidence-descriptions
description: >-
  Represent different descriptions, interpretations, provenance narratives, and factual claims about the same evidence without overwriting or prematurely resolving them.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Preserve competing descriptions

### Goal
Represent different descriptions, interpretations, provenance narratives, and factual claims about the same evidence without overwriting or prematurely resolving them.

### Assertion envelope

Every substantive description should use this structure:

```yaml
assertion_id: ASRT-2026-000211
about_entity: EV-2026-000184
subject: EV-2026-000184
predicate: "is_email_received_by"
object: AG-0021
verbatim_claim: "This is the invoice email I received."
normalized_claim: "Witness recognized the item as an invoice email received by the witness."
assertion_type: witness_testimony
asserted_by: AG-0021
speaker_capacity: fact_witness
asserted_at: "2026-08-20T19:47:00Z"
source_representation: REP-transcript-0009-01
source_locator: "54:11-55:7"
status: asserted
confidence_or_qualification: "Speaker identification; no independent authentication finding encoded."
```

### Conflict handling

- Link materially incompatible assertions with `leg:contradictsAssertion`.
- Use `leg:supportsAssertion` only for cited support, not as a truth adjudication.
- Allow multiple claims to be simultaneously active.
- Record a judicial finding, stipulation, or withdrawal as a separate assertion or decision that identifies its scope.
- Do not remove an assertion merely because it was challenged, excluded, or later corrected; change its status and add the subsequent record.

### Example PROV

```turtle
case:ASRT-witness-recognizes-email a leg:Assertion ;
  leg:assertsAbout case:EV-2026-000184 ;
  leg:assertsPredicate "recognized_as_received_email" ;
  leg:assertsObject case:AG-0021 ;
  leg:assertionType "witness_testimony" ;
  leg:assertionStatus "asserted" ;
  prov:wasAttributedTo case:AG-0021 ;
  prov:hadPrimarySource case:REP-transcript-0009-01 .

case:ASRT-opposing-party-denies-authorship a leg:Assertion ;
  leg:assertsAbout case:EV-2026-000184 ;
  leg:assertsPredicate "authored_by" ;
  leg:assertsObject case:AG-0099 ;
  leg:assertionType "party_position" ;
  leg:assertionStatus "disputed" ;
  prov:wasAttributedTo case:AG-0014 ;
  leg:contradictsAssertion case:ASRT-witness-recognizes-email .
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
