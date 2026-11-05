---
name: entity-resolution
description: >-
  Resolve whether records likely refer to the same person, vendor, company,
  account, project, asset, or document while preserving uncertainty and source
  provenance. Use for duplicate detection, vendor master review, AP controls,
  communication-graph identity work, document linking, and cross-system
  reconciliation. Require versioned signal contracts and order-invariance
  checks before model training or deployment. Do not merge identities
  automatically when conflict, fraud indicators, or insufficient evidence is
  present.
metadata:
  domain: data-quality
  risk-level: high-integrity
  compatibility: Requires source-specific identifiers and provenance for each candidate attribute.
---

# Purpose

Create explainable entity links, not opaque identity assertions.

Treat source records, identity hypotheses, accepted decisions, and derived embeddings as separate layers. A source account or mention is evidence about identity; it is not itself proof of a real-world entity.

## Workflow

1. Retain each source record as an independent entity with its own source ID.
2. Normalize comparison features without destroying originals: names, addresses, tax IDs, emails, bank details, phone numbers, domains, and account identifiers.
3. Generate candidates before scoring them. Measure whether the correct candidate enters the comparison set; a scorer cannot recover a blocked-out match.
4. Score exact, fuzzy, graph, and temporal signals separately. Do not let name or neighborhood similarity override a conflicting high-assurance identifier.
5. Record the evidence supporting and contradicting a proposed link.
6. Check cluster consistency. Pairwise links are not automatically transitive: `A≈B` and `B≈C` do not prove `A≈C`.
7. Apply decision thresholds:
   - `confirmed`: reliable, non-conflicting identifiers and policy-permitted evidence
   - `probable`: strong match requiring review or downstream caution
   - `possible`: weak or partial match
   - `not-linked`: insufficient or conflicting evidence
8. Route high-risk attributes—bank accounts, tax IDs, payment instructions, sanctions data, privileged access identities, and high-blast-radius clusters—to human review.
9. Record accepted, rejected, deferred, corrected, and reversed decisions as versioned precedents.
10. Keep links reversible. Preserve aliases, source-specific attributes, and the historical decision state. Do not destructively collapse source records.

## Signal integrity contract

A model is only as reliable as the live signal implementation that produced its features. Before training, evaluating, porting, or deploying an entity-resolution scorer:

1. Declare every signal's algorithm, normalization, output range, missing-value behavior, threshold semantics, implementation version, and order class.
2. Use known-answer fixtures computed from the declared reference implementation. Include values near every decision threshold.
3. Run the live callable against the fixtures. Documentation or copied formulas are not sufficient evidence.
4. Block training and release when a signal contract, cross-language parity fixture, or order invariant fails.
5. Version contract changes and invalidate models or thresholds trained on incompatible feature semantics.

Every pairwise operation must declare an order class:

- `SYMMETRIC`: swapping inputs must not change the result.
- `DIRECTIONAL`: subject/object order is meaningful and must be preserved.
- `CHRONOLOGICAL`: results depend on operational time, not arrival order.
- `CAUSAL`: antecedent and consequence cannot be silently reversed.
- `BATCH_INVARIANT`: permuting equivalent input batches must not change the output.

Order violations are correctness defects, not model-tuning problems.

### SequenceMatcher rule

Python's `difflib.SequenceMatcher.ratio()` can depend on argument order. For example, raw scores for `vendor_master` and `supplier_registry` can be `0.40` forward and `0.20` in reverse.

When SAME intends a symmetric Ratcliff-Obershelp name signal, the canonical primitive is:

```python
fwd = SequenceMatcher(None, a, b).ratio()
rev = SequenceMatcher(None, b, a).ratio()
score = (fwd + rev) / 2
```

This average is part of the declared SAME signal algorithm; it is not permission to hide an arbitrary asymmetric port. Cross-language implementations must reproduce both directional reference scores, the defined average, normalization, and threshold fixtures. Never assume an algorithm is symmetric because its purpose sounds symmetric.

## SAME execution requirements

When the implementation target is SAME:

- Inspect the live implementation and its imports before relying on notes, copied code, or generated fixtures.
- Run `python cli.py verify-signals` before training or accepting a scoring change.
- Export the signal fixtures and require every consumer implementation to pass them.
- Run both-direction property tests for every contract with `is_symmetric: true`.
- Search for direct similarity-library calls outside the canonical primitive. Either route them through the primitive or explicitly classify and test their order semantics.
- Keep SAME's implementation-specific training data, ablations, calibration tests, and model artifacts in SAME. PORK owns the portable behavior and certification requirements.
- Treat high confidence as a recommendation state, not authority for a consequential merge.

## Output format

```yaml
resolution_result:
  candidate_a: "entity-id"
  candidate_b: "entity-id"
  relationship: "same-as | related-to | not-linked | unresolved"
  confidence: 0.0
  supporting_evidence: []
  conflicting_evidence: []
  decision_basis: "rules | reviewer | model-assisted"
  reviewer_required: true
  provenance_links: []
  contract_version: "same.resolution/v1"
  signal_contract_version: "same.signals/v1"
  model_version: null
  constraints_checked: []
  precedent_links: []
```

## Fraud-sensitive signals

Flag, rather than auto-resolve:

- Same bank account across otherwise unrelated vendors
- New or recently changed banking details
- Free-email domains paired with a purported corporate vendor
- Near-match vendor names and remittance addresses
- Conflicts between tax identity, legal name, and payment recipient
