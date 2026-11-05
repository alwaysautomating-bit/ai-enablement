---
id: knowledge.governed-change-refinement
type: knowledge
title: Governed Change Refinement
status: canonical-draft
---

# Governed Change Refinement

High-quality change work is bounded twice: first by scope and observable behavior, then by evidence and authority.

## Reusable patterns

- **Bounded post-change refinement:** resolve an exact target, discover applicable standards, preserve observable behavior, avoid unrelated cleanup, inspect the resulting diff, and prefer no change over cosmetic churn.
- **Independent review perspectives:** select perspectives that match the change. Candidate generation and validation must be independent; parallel execution is optional.
- **Generate broadly, validate independently, publish narrowly:** exploration may be broad, but only separately validated findings may enter a confirmed report.
- **Confidence-gated publication:** confidence measures whether a finding is true and introduced by the change. Severity measures impact if true. They remain separate.
- **Pre-action state revalidation:** immediately before an external side effect, recheck eligibility, revision identity, citations, and authority.
- **Authority separation:** report, draft, apply, and publish are distinct operating permissions.
- **Immutable evidence citation:** use a full immutable revision and the smallest useful line range when available; disclose mutable evidence otherwise.

## Failure modes

- treating fewer lines as inherently clearer
- removing intentional abstractions or domain language
- reporting pre-existing or unreachable concerns
- confusing a severe hypothesis with a high-confidence finding
- publishing against a stale revision
- mechanically running every possible review perspective
