---
id: knowledge.semantic-stabilization-boundary
type: knowledge
title: Semantic Stabilization Boundary
description: Canonicalize what extracted assertions appear to mean without deciding whether they are operationally true.
tags: [pork, operational-state, identity-resolution, context-capture]
portable: true
status: canonical-draft
source_files:
  - C:/Projects/AIEnablementWorkspace/src/lib/context/stabilizer.ts
  - C:/Projects/PORK-context-capture/doctrine/operational-state/semantic-stabilization-boundary.md
---

# Semantic Stabilization Boundary

Extracted language is unstable. Different models and prompts can describe the same operational claim with different entities, predicates, directions, and dates. Before extracted assertions enter durable operational context, a stabilization layer canonicalizes what they appear to mean:

- entity identity and aliases;
- persistent entities versus activities, responsibilities, states, and processes attached to them;
- relationship normalization and direction;
- temporal and effective-state normalization;
- ambiguity and conflict signals instead of forced resolution.

## Persistent-entity invariant

A phrase made of a persistent entity plus an activity, responsibility, state, or process does not become another persistent entity. For example, “Acme contract approvals” describes work attached to Acme; it is not a second organization.

Test this invariant across domains rather than against memorized phrases from one corpus.

## Boundary

- Stabilization canonicalizes meaning; it never establishes truth.
- Evidence validation and human review remain the path to confirmed context.
- Preserve original values and disclose every transformation.
- Flag suspected direction reversals instead of silently swapping them.
- Report ambiguity, conflict, and sequence uncertainty instead of guessing.
- Results must not depend on input order.

SAME's `same.stabilization/v1` contract is one implementation of this boundary. The concept is independent of that implementation.
