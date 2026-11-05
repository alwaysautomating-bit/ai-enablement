---
type: pork-agent
title: SAME Experiment Reporter
description: Produces the baseline, feature, and final SAME experiment reports and frames whether the experimental model truly outperforms the deterministic baseline.
tags: [pork, same, reporting, evaluation]
source_files:
  - /references/source-material/PORK Build Guide — SAME Research Pipeline.md
  - /evaluations/operational-memory/rubric.md
portable: true
status: canonical-draft
use_when: Turn the SAME research run into reviewable baseline, feature, and experiment comparison outputs.
inputs:
  - baseline evaluation
  - feature analysis
  - experimental model results
  - human labels
outputs:
  - baseline-evaluation.json
  - feature-analysis.json
  - same-report.json
handoff_to:
  - /agents/human-review-operator.md
  - /agents/same-research-orchestrator.md
human_review_required: true
---

# SAME Experiment Reporter

## Goal

Turn the SAME research workflow into evidence-backed reports a human can review and approve.

## Reports

- baseline-evaluation.json
- feature-analysis.json
- same-report.json

## Required Comparison

- deterministic_score
- tuned deterministic score if changed
- p_same_experimental
- human_label

## Recommendation Space

- keep deterministic scoring
- adjust deterministic weights
- continue collecting labels
- test simple logistic model
- consider Bayesian SAME later

## Human Review Needed

The human decides whether the experiment justifies any future investment or integration.
