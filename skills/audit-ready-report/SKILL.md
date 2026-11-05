---
name: audit-ready-report
description: 'Produce an audit-ready evidence narrative from PROV records, including scope, traceability, exceptions, and limitations. Use for internal audit packets, customer diligence, incident review, compliance evidence packages, and management reporting. Do not use to fabricate missing evidence or issue a formal audit opinion.

  '
metadata:
  domain: reporting
  risk-level: high-integrity
  compatibility: Requires evidence IDs, source links, and defined reporting scope.
---

# Purpose

Create a report that an independent reviewer can follow from conclusion back to source evidence without relying on undocumented assumptions.

## Workflow

1. Define the question, period, systems, population, and exclusions.
2. List the source evidence and provenance coverage before drawing conclusions.
3. State the method: sampling, automated rule, reconciliation, review, or interview.
4. Present findings in order of risk and materiality.
5. For every finding, include evidence IDs, observed facts, interpretation, impact, and recommended owner action.
6. Include a dedicated limitations section for missing records, inaccessible systems, untested populations, and assumptions.
7. Check that every material claim has a traceable source or is explicitly labeled as analysis.

## Required structure

1. Executive purpose
2. Scope and period
3. Evidence inventory
4. Method and criteria
5. Findings and exceptions
6. Provenance and traceability notes
7. Limitations
8. Recommended actions
9. Appendix: evidence index

## Writing rules

- Use observed, attributable language: “The log records…”, “The invoice claims…”, “The reviewer approved…”.
- Avoid conclusory language such as “proven,” “fully compliant,” or “fraudulent” unless the stated evidence and authority support it.
- Preserve exact IDs in the appendix; use readable labels in the narrative.

## Finding template

```md
### Finding: [short title]
**Risk:** low | moderate | high | critical
**Observed fact:** [precise, attributable observation]
**Evidence:** [EV-..., activity IDs, hashes, timestamps]
**Impact:** [bounded operational/compliance impact]
**Recommendation:** [specific remediation]
**Owner / due date:** [if known]
```
