---
name: explain-change
description: Generate and evaluate evidence-backed explanations for why an observed operational change occurred while separating confirmed causes, contributing factors, hypotheses, and unsupported speculation.
---

# Explain Change

Explain why an observed change most likely happened.

## Core question

Why did it happen?

## Responsibilities

- identify plausible contributing factors
- distinguish cause from correlation
- rank explanations
- find supporting and contradicting evidence
- preserve multiple-factor explanations
- identify evidence needed to test hypotheses

## Required output

```yaml
change_explanation:
  confirmed_causes:
    - cause: string
      evidence: []
      confidence: number
  contributing_factors:
    - factor: string
      evidence: []
      confidence: number
  hypotheses:
    - hypothesis: string
      supporting_evidence: []
      contradicting_evidence: []
      evidence_needed: []
      confidence: number
  unsupported_explanations_rejected: []
  summary:
    most_likely_explanation: string
    confidence: number
```

## Boundary

This skill explains the change.

It does not map all dependencies or determine impact.
