---
name: analyze-investigative-timeline
description: Analyze a source-linked event timeline to correlate activity, identify patterns, test expected-event gaps, and direct further investigation. Use across fraud, security, data-quality, legal, audit, and research investigations after relevant events have been collected; do not treat absence or temporal proximity alone as proof.
metadata:
  domain: investigation
  risk-level: high-integrity
  compatibility: LLM-independent; works with spreadsheets, event ledgers, provenance graphs, and chronology artifacts.
---

# Analyze an investigative timeline

Turn ordered events into investigative understanding. A timeline is useful when it explains relationships, exposes uncertainty, and shows where the record is incomplete—not merely when rows are sorted by time.

## Boundary

- Use `collapse-chronology` first when raw threads, testimony, files, or fragmented records still need to become an event chronology.
- Use `reconstruct-partial-event-order` when exact ordering is unsupported or conflicting.
- This skill analyzes a chronology. It does not declare fraud, attack, liability, credibility, or causation from proximity or missing data alone.

## Normalize without destroying evidence

For each event, retain:

- original timestamp text, timezone or offset, and source locator;
- normalized UTC timestamp in ISO 8601 when conversion is supported;
- conversion method and any assumptions;
- actor or identity, system or location, event and artifact type, object or path, concise summary, raw event or immutable reference, validation status, and source ID.

If the timezone is unknown or disputed, do not force a UTC value. Mark the event unresolved and analyze only the ordering the evidence supports.

## Select signal

Include events that are materially relevant, validated findings, or explicitly labeled investigation candidates. Exclude routine noise only with a reproducible reason. Keep `confirmed`, `suspicious`, `needs_validation`, and `context_only` distinct.

Repeated equivalent events may be represented as a bounded series when every member remains recoverable. Preserve first seen, last seen, count, grouping rule, and the underlying event references. Never group away a change of actor, target, status, evidence quality, or behavior.

## Investigative analysis

1. Define the incident, allegation, question, or anomaly being investigated.
2. Divide the chronology into meaningful phases such as before, during, and after the focal event; use domain-appropriate names when stronger phase boundaries exist.
3. Correlate across independent artifact or source types. Identify shared actors, systems, objects, identifiers, sessions, locations, and causal or derivational links.
4. Ask what changed at each material event and which later events depend on it.
5. Distinguish temporal proximity, correlation, information flow, and supported causation.
6. Identify recurrent patterns, clusters, pivots, boundary crossings, and unexpected state transitions.
7. Compare observed sequences with an explicit expected-event model.
8. Turn unresolved gaps and anomalies into bounded hypotheses and next evidence requests.

## Expected-event gaps

An absence becomes an investigative finding only when all of the following are recorded:

- the event was reasonably expected under a named process, system behavior, policy, or comparison baseline;
- the relevant source would normally capture it;
- source coverage and retention for the interval are understood;
- plausible benign explanations were considered;
- the absence is stated as a gap or hypothesis, not as proof of concealment or misconduct.

Classify each gap as `collection_gap`, `coverage_gap`, `expected_event_absent`, `sequence_anomaly`, `retention_unknown`, or `unresolved`. Record what evidence could distinguish among explanations.

## Domain prompts

- **Fraud:** What identity, payment, approval, communication, or control events should surround the transaction? Are apparently independent records derived from one source?
- **Data:** Where did values change, disappear, duplicate, arrive late, or violate an expected pipeline transition? Could instrumentation or retention explain the gap?
- **Legal:** What does the record show before and after the disputed event? Preserve attributed assertions, procedural context, and source authority; do not adjudicate legal conclusions.
- **Research:** Which observations preceded a conclusion, what methods or transformations intervened, and which expected controls, measurements, or replications are absent?

## Output contract

```yaml
investigative_question: "..."
scope:
  time_range: "..."
  entities: []
  sources: []
  coverage_limitations: []
time_normalization:
  target: UTC
  unresolved_timezones: []
phases: []
material_events: []
correlations:
  - event_ids: []
    relationship: "..."
    basis: "..."
    confidence: 0.0
patterns: []
gaps:
  - gap_id: "..."
    class: collection_gap | coverage_gap | expected_event_absent | sequence_anomaly | retention_unknown | unresolved
    expected_event: "..."
    expectation_basis: "..."
    source_capture_assessment: "..."
    alternative_explanations: []
    evidence_needed: []
hypotheses:
  - hypothesis: "..."
    supporting_event_ids: []
    contradicting_event_ids: []
    status: open | strengthened | weakened | rejected
next_investigative_actions: []
limitations: []
```

## Completion gate

The analysis is complete only when material conclusions trace to events; time conversions are inspectable; gaps have an explicit expectation basis and coverage assessment; alternative explanations remain visible; and each unresolved question names the evidence needed next.

