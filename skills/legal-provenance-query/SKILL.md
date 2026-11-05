---
name: legal-provenance-query
description: >-
  Answer targeted legal evidence questions from the graph with source-linked, qualified results.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Answer provenance questions

### Goal
Answer targeted legal evidence questions from the graph with source-linked, qualified results.

### Supported question types

```yaml
question_types:
  - "Who introduced this item?"
  - "Who first produced or collected this item?"
  - "Who handled this item between two dates?"
  - "What is the chain of custody?"
  - "Was the item offered, admitted, excluded, or admitted for a limited purpose?"
  - "Who authenticated or challenged it?"
  - "What did each witness say about it?"
  - "What competing descriptions exist?"
  - "Which derivative was used at trial?"
  - "What gaps or integrity exceptions exist?"
```

### Response contract

Every answer must return:

```yaml
answer: "Short, qualified answer"
confidence: high | medium | low
basis:
  - event_or_assertion_id: "..."
    source_locator: "..."
    provenance_path: ["..."]
qualifications:
  - "Offer of evidence is not an admission ruling."
unresolved_issues:
  - "No recipient receipt is recorded for the transfer on 2026-08-18."
```

### Example query results

**Question:** Who introduced PX-17?

**Answer:** Plaintiff’s counsel offered representation `REP-2026-000184-02` as PX-17 during the August 21 hearing. The record reflects an offer for the purpose of showing notice; that offer is distinct from the later admission decision. The source is transcript reference 145:8–146:3.

**Question:** Was PX-17 admitted?

**Answer:** The court admitted PX-17 for the limited purpose of showing notice, not for the truth of the matter asserted, subject to a limiting instruction. The ruling should be read with its stated scope and any later modification.

---
## Legal-use guardrails

- Preserve records and provenance without deciding admissibility, authenticity, credibility, relevance, privilege, or legal sufficiency.
- Require authorized legal review for jurisdiction-specific evidentiary determinations.
- Keep analysis, party argument, witness testimony, technical validation, and court rulings distinct.
- Avoid automated truth labels for disputed evidence; preserve traceable assertions, uncertainty, and gaps.
- Retain original language, artifacts, and source locations for independent inspection.

## Source provenance

Adapted from [Legal Evidence Provenance Skills](../../references/source-material/legal-evidence-provenance-skills.md). The source document remains evidence; this skill is the callable procedure.
