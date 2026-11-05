---
name: control-mapping
description: 'Map observed PROV events, artifacts, and evidence to operational, financial, security, or compliance controls. Use for control testing, gap assessment, audit preparation, and evidence collection. Do not present a mapping as a certification, legal conclusion, or proof that a control operates effectively without sufficient test evidence.

  '
metadata:
  domain: compliance
  risk-level: controlled
  compatibility: Works with internal control libraries and frameworks such as CMMC, NIST, SOC 2, HIPAA, AP policies, and customer-specific requirements.
---

# Purpose

Turn provenance records into defensible control evidence while preserving the difference between a control requirement, its design, evidence of execution, and a conclusion about effectiveness.

## Required inputs

- Applicable framework or internal control library version
- Scope: entity, process, system, time period, population, and exclusions
- Control objective and control owner
- Available evidence IDs and source artifacts
- Test procedure, if one exists

## Workflow

1. State the framework and exact control identifier before mapping.
2. Restate the control objective in plain language.
3. Identify the expected evidence: preventive, detective, corrective, or monitoring.
4. Link evidence by immutable ID; do not cite a dashboard screenshot when a source event exists.
5. Evaluate evidence quality: completeness, timeliness, attribution, integrity, and relevance.
6. Record exceptions separately from observations and recommendations.
7. Give a bounded conclusion: `not assessed`, `design evidence only`, `execution evidenced`, `exception observed`, or `insufficient evidence`.
8. Identify what additional evidence would change the conclusion.

## Control-evidence matrix

Use this structure:

| Field | Requirement |
|---|---|
| Control ID | Exact framework or internal identifier |
| Objective | Risk being mitigated |
| Evidence | Immutable IDs and source descriptions |
| Period | Date range tested |
| Procedure | How evidence was evaluated |
| Result | Bounded result, not a certification |
| Exceptions | Specific deviations and severity |
| Follow-up | Owner and next evidence needed |

## Guardrails

- Do not conflate a policy document with proof of operation.
- Do not infer approval from a timestamp without an attributable approval event.
- Do not claim compliance for systems, teams, or periods outside the stated scope.
- Escalate suspected fraud, data tampering, access-control bypass, or evidence deletion immediately.
