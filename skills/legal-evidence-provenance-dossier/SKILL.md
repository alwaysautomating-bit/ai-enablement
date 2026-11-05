---
name: legal-evidence-provenance-dossier
description: >-
  Produce a human-readable and machine-verifiable narrative for a selected evidence item, representation, exhibit, or issue.
metadata:
  domain: legal-evidence-provenance
  risk-level: high-integrity
---

# Generate an evidence provenance dossier

### Goal
Produce a human-readable and machine-verifiable narrative for a selected evidence item, representation, exhibit, or issue.

### Inputs

```yaml
subject_id: EV-2026-000184
scope: full_history | custody_only | authentication_only | court_history | assertions_only
as_of: "2026-08-22T00:00:00Z"
include:
  raw_identifiers: true
  hashes: true
  unresolved_gaps: true
  competing_assertions: true
  privileged_records: false
output_format: markdown | pdf | jsonld | turtle
```

### Required sections

1. **Item identity.** Evidence ID, representation IDs, media type, version relationships, hashes, and known source.
2. **Custody timeline.** Every acquisition, handoff, location, integrity check, and unaccounted-for interval.
3. **Authentication history.** Methods, witnesses, examiner results, limitations, challenges, and stipulations.
4. **Introduction and court history.** Production, exhibit marking, offer, objections, rulings, admission scope, and publication.
5. **Discussion record.** Who discussed the item, their capacity, exact citations or locators, and the nature of discussion.
6. **Competing descriptions.** A neutral table listing assertions, source, status, support, and contradiction links.
7. **Open issues.** Missing custody receipt, incomplete hash verification, unresolved foundation objection, or ambiguous exhibit mapping.
8. **Integrity receipt.** Dataset snapshot ID, generation time, query parameters, and graph/hash manifest.

### Dossier language rules

- Use neutral wording: “Party A asserts,” “Witness B testified,” “The court ruled,” “The record does not show.”
- Never use “proves,” “authentic,” “admissible,” or “established” without identifying the authority and limited scope of that conclusion.
- Distinguish source evidence from analysis and legal argument.

---
## Legal-use guardrails

- Preserve records and provenance without deciding admissibility, authenticity, credibility, relevance, privilege, or legal sufficiency.
- Require authorized legal review for jurisdiction-specific evidentiary determinations.
- Keep analysis, party argument, witness testimony, technical validation, and court rulings distinct.
- Avoid automated truth labels for disputed evidence; preserve traceable assertions, uncertainty, and gaps.
- Retain original language, artifacts, and source locations for independent inspection.

## Source provenance

Adapted from [Legal Evidence Provenance Skills](../../references/source-material/legal-evidence-provenance-skills.md). The source document remains evidence; this skill is the callable procedure.
