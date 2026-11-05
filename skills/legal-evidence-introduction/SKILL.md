---
name: legal-evidence-introduction
description: >-
  Track the person or party who introduced, produced, disclosed, offered, marked, filed, or presented an evidence item, and distinguish these actions.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Track who introduced evidence

### Goal
Track the person or party who introduced, produced, disclosed, offered, marked, filed, or presented an evidence item, and distinguish these actions.

### Introduction taxonomy

| Action | Meaning |
|---|---|
| `created` | Originated the item or underlying record |
| `collected` | Obtained it during investigation or discovery |
| `produced` | Delivered it in discovery or disclosure |
| `identified` | Identified it during deposition, hearing, or trial |
| `marked` | Assigned an exhibit or demonstrative designation |
| `offered` | Asked the court to receive it |
| `admitted` | Court accepted it, possibly with limits |
| `published` | Displayed or read it to a factfinder or audience |
| `filed` | Submitted it in a docketed filing |

### Inputs

```yaml
introduction_event_id: INTRO-2026-000019
representation_id: REP-2026-000184-02
action: offered
introduced_by:
  agent_id: AG-0010
  name: "Plaintiff's Counsel"
  capacity: counsel
forum:
  court_name: "Example District Court"
  proceeding_id: HEARING-2026-08-21
  transcript_reference: "Tr. 145:8-146:3"
exhibit_number: "PX-17"
occurred_at: "2026-08-21T16:12:00Z"
offered_for_purpose: "To show notice"
foundation_reference: AUTH-2026-000044
```

### Required behavior

- Never equate an offer with admission.
- Preserve party designation and exhibit number as event-specific metadata; an item may have multiple designations across proceedings.
- Capture the exact stated purpose where available.
- Link a filing, transcript excerpt, minute entry, exhibit list, or hearing recording that supports the introduction event.

---
## Legal-use guardrails

- Preserve records and provenance without deciding admissibility, authenticity, credibility, relevance, privilege, or legal sufficiency.
- Require authorized legal review for jurisdiction-specific evidentiary determinations.
- Keep analysis, party argument, witness testimony, technical validation, and court rulings distinct.
- Avoid automated truth labels for disputed evidence; preserve traceable assertions, uncertainty, and gaps.
- Retain original language, artifacts, and source locations for independent inspection.

## Source provenance

Adapted from [Legal Evidence Provenance Skills](../../references/source-material/legal-evidence-provenance-skills.md). The source document remains evidence; this skill is the callable procedure.
