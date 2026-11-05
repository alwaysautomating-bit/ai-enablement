---
name: legal-admission-status
description: >-
  Record the procedural status of an offered item while preserving every offer, objection, ruling, condition, and scope limitation.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Record admission, exclusion, and limits

### Goal
Record the procedural status of an offered item while preserving every offer, objection, ruling, condition, and scope limitation.

### Inputs

```yaml
decision_id: ADMIT-2026-000031
representation_id: REP-2026-000184-02
proceeding_id: HEARING-2026-08-21
court_agent_id: AG-COURT-001
offer_id: INTRO-2026-000019
decision: admitted | admitted_limited | excluded | reserved | withdrawn | not_reached
occurred_at: "2026-08-21T16:14:00Z"
scope: "Admitted solely to show notice; not for truth of the matter asserted."
conditions:
  - "Limiting instruction to be given."
authority_reference: "Tr. 146:5-147:2"
exhibit_number: "PX-17"
```

### Required behavior

- Maintain separate status dimensions: authentication, offer, ruling, publication, appellate treatment, and exhibit handling.
- Never reduce `admitted_limited` to simply `admitted`.
- Store exact scope and conditions as quoted text plus a normalized classification.
- Treat later reconsideration, reversal, or sealing as new decisions linked to the earlier decision.

### Status dimensions

| Dimension | Example values |
|---|---|
| Authentication | not reviewed, offered, contested, stipulated, accepted, rejected |
| Offer | not offered, offered, withdrawn, reserved |
| Court disposition | not decided, admitted, admitted limited, excluded, deferred |
| Use at proceeding | marked, used in examination, published, received but not published |
| Review status | unchallenged, reconsidered, appealed, affirmed, reversed |

---
## Legal-use guardrails

- Preserve records and provenance without deciding admissibility, authenticity, credibility, relevance, privilege, or legal sufficiency.
- Require authorized legal review for jurisdiction-specific evidentiary determinations.
- Keep analysis, party argument, witness testimony, technical validation, and court rulings distinct.
- Avoid automated truth labels for disputed evidence; preserve traceable assertions, uncertainty, and gaps.
- Retain original language, artifacts, and source locations for independent inspection.

## Source provenance

Adapted from [Legal Evidence Provenance Skills](../../references/source-material/legal-evidence-provenance-skills.md). The source document remains evidence; this skill is the callable procedure.
