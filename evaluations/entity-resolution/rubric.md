# Entity Resolution Capability Evaluation

## Goal

Certify that an entity-resolution implementation produces portable, explainable, order-correct proposals without silently converting similarity into identity authority.

## Required gates

### Evidence and provenance

- Original source records and source identifiers remain intact.
- Supporting, conflicting, and missing evidence are distinguishable.
- High-assurance conflicts cannot be overridden by name or graph similarity alone.

### Signal integrity

- Every signal declares its algorithm, normalization, range, missing-value behavior, thresholds, order class, and contract version.
- The live callable passes known-answer and threshold-boundary fixtures.
- Cross-language ports pass the same exported fixtures.
- Training and release fail closed on contract violations.

### Order correctness

- Symmetric signals pass both-direction fixtures and property tests.
- Directional relations preserve subject and object.
- Chronological results do not depend on ingestion order.
- Batch-equivalent inputs produce invariant results when declared.

### Resolution and clustering

- Candidate-generation recall is measured separately from scorer accuracy.
- Pairwise links are checked for cluster-level contradictions and weak-link bridges.
- Shared accounts, roles, bots, and other many-to-many identities appear in hard cases.

### Governance and memory

- Confidence never grants authority by itself.
- Consequential merges require policy-permitted review.
- Decisions are versioned, reversible, and usable as governed precedents.
- Previous decisions inform investigation but do not silently dictate new outcomes.

## Pass condition

All correctness and governance gates pass. Performance metrics may determine whether an implementation is useful, but they cannot waive signal-contract, provenance, order, or review failures.
