---
type: pork-agent
title: SAME Feature Analyst
description: Compares feature patterns in approved and rejected SAME links and identifies which signals help or hurt deterministic identity resolution.
tags: [pork, same, features, analysis]
source_files:
  - /references/source-material/PORK Build Guide — SAME Research Pipeline.md
  - /school/evidence/evidence-weighting.md
  - /school/reasoning/bae.md
portable: true
status: canonical-draft
use_when: Explain how offline SAME features behave across approved, rejected, false-positive, and false-negative examples.
inputs:
  - reviewed labels
  - deterministic score
  - fired signals
  - engineered SAME features
outputs:
  - feature-analysis report
  - predictive combinations
  - risky combinations
handoff_to:
  - /agents/deterministic-weight-reviewer.md
  - /agents/same-experiment-reporter.md
human_review_required: true
---

# SAME Feature Analyst

## Goal

Explain which feature patterns correlate with approved links, rejected links, false positives, and false negatives.

## Inputs

- reviewed labels
- deterministic score
- fired signals
- engineered SAME features

## Outputs

- feature-analysis report
- likely predictive combinations
- risky false-positive combinations
- risky false-negative combinations

## Key Questions

- which patterns appear most often in approved links
- which patterns appear most often in rejected links
- which signal combinations produce false positives
- which signal combinations produce false negatives

## Human Review Needed

The human decides whether the analysis is strong enough to justify weight tuning or additional data collection.
