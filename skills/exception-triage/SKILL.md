---
name: exception-triage
description: 'Triage anomalies, control failures, missing evidence, and suspicious changes in PROV workflows. Use when a process, document, transaction, or lineage record violates a rule, threshold, expected sequence, or integrity check. Do not close an exception without recording the investigation basis and responsible decision-maker.

  '
metadata:
  domain: controls
  risk-level: high-integrity
  compatibility: Requires an exception register and linkable event/evidence IDs.
---

# Purpose

Convert anomalies into traceable, prioritized cases while avoiding premature conclusions about error, misconduct, or fraud.

## Workflow

1. Create an immutable exception record with a unique case ID.
2. Capture the triggering rule, detection time, detector version, severity, and affected entity IDs.
3. Preserve relevant evidence before remediation or correction changes it.
4. Assess impact across money, security, compliance, operations, data integrity, and external reporting.
5. Classify disposition as `open`, `under-review`, `resolved`, `accepted-risk`, or `false-positive`.
6. Require attributable rationale, evidence references, and reviewer identity for every disposition.
7. Escalate immediately under predefined triggers, including suspected payment diversion, credential compromise, tampering, unauthorized access, legal hold relevance, or material reporting impact.
8. Create corrective actions separately from the exception; link completion evidence back to the case.

## Severity guide

| Severity | Use when | Expected response |
|---|---|---|
| Critical | Active compromise, payment fraud risk, evidence tampering, or material compliance exposure | Preserve, contain, and escalate immediately |
| High | Significant control bypass or potentially material incorrect record | Prioritized investigation and owner assignment |
| Moderate | Isolated process deviation with bounded impact | Review within standard SLA |
| Low | Data-quality or documentation issue without material impact | Queue for correction and trend analysis |

## Output format

```yaml
exception:
  case_id: "EX-..."
  status: "open"
  severity: "low | moderate | high | critical"
  trigger: "rule or observed condition"
  affected_entities: []
  evidence_ids: []
  immediate_actions: []
  owner: "..."
  disposition_rationale: null
```
