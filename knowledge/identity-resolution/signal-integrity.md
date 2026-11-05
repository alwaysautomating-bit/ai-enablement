---
id: knowledge.entity-resolution-signal-integrity
type: pork-concept
title: Entity Resolution Signal Integrity
description: Entity-resolution features require executable, versioned contracts and declared order semantics because silent signal drift can change identity decisions before any model is trained.
tags: [pork, identity, entity-resolution, signals, invariants, portability]
related_skills:
  - /skills/entity-resolution/SKILL.md
portable: true
status: canonical-draft
---

# Entity Resolution Signal Integrity

## Portable concept

An entity-resolution model cannot compensate for a feature whose live implementation differs from its declared meaning. Signal extraction is part of the model contract, not incidental preprocessing.

## Required contract

Each signal declares:

- semantic purpose
- reference algorithm and normalization
- output range and missing-value behavior
- threshold semantics
- order class
- known-answer fixtures, including threshold boundaries and adversarial cases
- implementation and contract versions

Training and release stop when the live callable fails this contract.

## Order semantics

Pairwise similarity is symmetric only when the declared implementation proves `f(a,b) = f(b,a)`. Directional, chronological, causal, and batch-invariant operations require different tests. An order-class violation makes results depend on ingestion or argument order and is therefore a correctness and auditability defect.

Python's `SequenceMatcher.ratio()` demonstrates why intent is insufficient: it may return different values when its arguments are reversed. When symmetric Ratcliff-Obershelp similarity is intended, SAME defines the primitive as the average of the forward and reverse reference scores. That definition and its fixtures must be reproduced by every port.

## Portability boundary

PORK owns the portable invariant and certification gate. SAME owns its concrete signal implementations, training data, model experiments, and detailed benchmarks. Consumers own authoritative identity decisions and may store governed resolution precedents. Cross-language fixture exports connect these layers without duplicating the source of truth.

## Consequence

Models trained with incompatible signal semantics are not comparable. A material contract change requires a new version, threshold review, and retraining or explicit compatibility evidence.
