---
name: review-change-high-confidence
description: Review a local or hosted change using independent validation, confidence gating, immutable evidence, and permissioned publication.
---

# Review Change with High Confidence

## Method

1. Resolve repository, base revision, head revision, change surface, and full immutable head identity.
2. Resolve outcome authority: `report`, `draft`, or `publish`.
3. Check eligibility and current review state.
4. Gather description, acceptance criteria, changed files, applicable instructions, surrounding code, contracts, tests, and relevant history.
5. Select only perspectives matching the diff: instruction compliance, changed-lines defects, call-site/data flow, boundaries, acceptance criteria, history, security/privacy/isolation, migrations/concurrency/transactions, UI/accessibility, or performance/reliability/resource lifecycle.
6. Generate candidates and validate each independently. Parallel execution is optional.
7. Record the affected invariant, risky code, realistic trigger, impact, evidence, confidence, severity, introduced-by-change decision, and immutable citation when available.
8. Suppress findings below the configured confidence threshold; default 80 on a 0–100 scale.
9. Immediately before publication, re-fetch state and confirm unchanged head identity, eligibility, citations, and publication authority.

## Exclusions

Exclude pre-existing issues, unsupported style preferences, unreachable speculation, clear automated-tool duplicates, intentional required behavior, and unmodified code unless the change newly exposes it.

## Boundary

A request to review authorizes analysis only. Drafting or external publication requires its own authority. Never publish against a stale revision.
