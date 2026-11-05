---
name: reconstruct-partial-event-order
description: Reconstruct defensible event order when the complete history is unavailable by separating record order, alleged occurrence time, and information-acquisition order. Use for legal casework, investigations, incident review, audit, and provenance analysis where timestamps are incomplete, conflicting, approximate, or derived. Do not collapse partial order into a single asserted chronology.
metadata:
  domain: provenance
  risk-level: high-integrity
  compatibility: LLM-independent; works with tables, event ledgers, provenance graphs, and document corpora.
---

# Reconstruct partial event order

Build an inspectable ordering model without pretending the evidence supports a complete timeline.

## The three clocks

For every event or claim, record independently:

1. **Record order** — where and when the claim appears in the authoritative record, proceeding, log, transcript, or source sequence.
2. **Occurrence time** — when the described real-world event allegedly happened, including its precision, interval, anchor, and original assertion text.
3. **Information order** — when the information entered the working corpus or became available to an actor, plus the source or stage from which it was derived.

Keep provenance lineage and derivation depth separate from all three clocks. A later or more derivative source may describe an earlier occurrence.

## Procedure

1. Assign a stable ID to each event, claim, and source artifact.
2. Populate each clock only from traceable evidence. Use `unknown` when evidence is absent.
3. Preserve the raw temporal language alongside every normalized value.
4. Encode supported ordering relations as edges such as `before`, `after`, `same_record_sequence`, `derived_from`, or `known_by_at`.
5. Label every relation `observed`, `asserted`, `derived`, or `inferred`, and attach its source locator.
6. Build a directed graph from the supported relations. Detect contradictions and cycles before presenting an order.
7. Compute a topological ordering only as a display aid. Preserve ties and incomparable events as an equivalence group or unresolved set.
8. Report contradictions, missing anchors, precision loss, and alternative valid orderings.

## Logical-clock rule

A sequence counter can represent information order in a bounded corpus, similar to a Lamport-style logical clock. If the evidence establishes that A informed B, then A must precede B in that information order. The reverse inference is invalid: a lower sequence value alone does not prove that A caused, informed, or occurred before B.

## Output contract

```yaml
ordering_status: complete | partial | conflicting | insufficient
events:
  - event_id: "..."
    record_order: {value: "...", source_locator: "..."}
    occurrence_time:
      value: "..."
      precision: exact | approximate | interval | relative | unknown
      anchor: "..."
      raw_assertion: "..."
    information_order:
      sequence: 0
      corpus_stage: "..."
      derived_from: "..."
    provenance:
      source_id: "..."
      derivation_depth: 0
      lineage_status: known | partial | broken | inferred
relations:
  - from: "event-a"
    relation: before | after | same_record_sequence | derived_from | known_by_at
    to: "event-b"
    basis: observed | asserted | derived | inferred
    source_locator: "..."
incomparable_sets: []
contradictions: []
limitations: []
```

## Guardrails

- Never substitute record order or information order for occurrence time.
- Never sort unknown occurrence times lexically or assign fabricated defaults.
- Never treat a display sequence as proof of causality.
- Never silently choose among multiple valid topological orders.
- Never convert approximation, interval, or relative time into false precision.
- In legal work, describe evidentiary structure; do not decide credibility, authenticity, admissibility, or ultimate fact.

## Companion skills

- Use `evidence-chain` to reconstruct derivation paths.
- Use `provenance-data-model` to persist the clocks and relations.
- Use `legal-provenance-event-ledger` for append-only legal case events.
- Use `legal-provenance-query` to answer source-linked questions from the resulting graph.

