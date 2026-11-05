---
name: collapse-chronology
description: Collapse long chat threads, large text files, transcripts, testimony, and fragmented records into a source-linked chronology with state transitions, supersession, contradictions, and uncertainty preserved. Use when the deliverable is an event sequence or current-state history rather than a general summary or handoff.
metadata:
  domain: provenance
  risk-level: high-integrity
  compatibility: LLM-independent; accepts text, documents, transcript segments, chat exports, or structured event records.
---

# Collapse chronology

Produce an inspectable chronology, not a conversational summary and not a falsely complete timeline.

## Boundary

- Use `thread-collapse-handoff` when the primary need is broad operational memory, decisions, projects, risks, and next actions.
- Use this skill when event order, changes over time, supersession, or testimony sequence is load-bearing.
- Use `reconstruct-partial-event-order` when the sources cannot support one total order; apply its three-clock and partial-order rules here.
- Use `analyze-investigative-timeline` after collapse when the task is to correlate events, test patterns, or investigate expected-event gaps.
- A chronology organizes the record. It does not establish that an attributed assertion is true.

## Prepare the source

1. Define the subject, time boundary, source set, and requested level of detail.
2. Assign stable IDs and locators to source artifacts and segments before synthesis.
3. For material too large for one context window, process bounded, overlapping segments. Maintain a continuation register containing active entities, unresolved references, latest supported states, open conflicts, and boundary events.
4. Preserve the original source order and raw temporal language. Never overwrite the source with normalized output.

## Extract atomic event candidates

Create a separate event candidate whenever the source describes a materially distinct:

- occurrence, observation, communication, decision, instruction, action, correction, withdrawal, ruling, or state change;
- acquisition or recording of information; or
- assertion about any of the above.

Do not combine events merely because they appear in the same sentence or paragraph. Do not split one continuing event without a meaningful change in actor, action, object, status, or time.

For each event, capture:

```yaml
event_id: "stable-id"
event_type: "..."
actor: "..."
action: "..."
object: "..."
record_order: "source position"
occurrence_time:
  value: "..."
  precision: exact | approximate | interval | relative | unknown
  raw_assertion: "..."
information_order:
  sequence: 0
  acquired_at: "..."
source:
  artifact_id: "..."
  segment_id: "..."
  locator: "..."
assertion_status: observed | attributed | derived | inferred
confidence: 0.0
```

Unknown fields remain unknown. Never fabricate timestamps, speakers, IDs, or locators.

## Reconstruct order

1. Keep record order, alleged occurrence time, and information-acquisition order distinct.
2. Add sourced relations such as `before`, `after`, `during`, `overlaps`, `derived_from`, `corrects`, and `supersedes`.
3. Label each relation `observed`, `asserted`, `derived`, or `inferred` and cite its source segment.
4. Detect contradictions, cycles, gaps, and incomparable events.
5. Use a topological ordering only as a presentation aid. Preserve multiple valid orders and ties.

## Reconstruct state and supersession

Describe important transitions as small, concrete before-and-after changes:

```yaml
transition_id: "..."
subject: "..."
before: "..."
event_id: "..."
after: "..."
effective_time: "..."
recorded_time: "..."
status: confirmed | probable | disputed | unresolved
source_refs: []
```

Treat an earlier plan, instruction, assertion, or state as superseded only when a later source actually replaces, withdraws, corrects, or invalidates it. A newer mention, competing option, or conflicting assertion does not silently erase earlier material. Preserve the prior item and link the superseding item.

## Testimony and evidentiary material

When the source contains testimony, court records, expert reports, filings, or evidentiary discussion:

- Keep the source of record distinct from the generated chronology.
- Model testimony, expert opinion, party argument, attorney characterization, and analytical inference as attributed assertions.
- Preserve witness or speaker, capacity, proceeding, examination phase, and page-line or timestamp when available.
- Do not treat an attorney's question as testimony unless the witness adopts it.
- Preserve competing assertions independently and link conflicts, corrections, withdrawals, stipulations, and rulings without rewriting history.
- Do not convert repetition into independent corroboration; track common source ancestry when known.
- Keep extraction confidence separate from any assessment of evidentiary support.
- Do not decide credibility, authenticity, admissibility, relevance, or legal sufficiency.

## Uncertainty and escalation

Preserve provisional dates, ambiguous identity, unclear authority, missing source coverage, unresolved contradictions, and open dependencies. Escalate for review when authority is unclear, a material source cannot be located, later evidence conflicts, or downstream action would be risky without confirmation.

## Output contract

```yaml
chronology_scope: "..."
coverage:
  source_artifacts: []
  time_range: "..."
  known_gaps: []
ordering_status: complete | partial | conflicting | insufficient
events: []
ordering_relations: []
state_transitions: []
supersession_links: []
competing_assertions: []
incomparable_event_sets: []
contradictions: []
current_state:
  summary: "..."
  as_of: "..."
  confidence: high | medium | low
open_questions: []
review_required: []
generation_provenance:
  skill: collapse-chronology
  input_ids: []
  generated_at: "..."
```

Finish with a short reader-facing narrative, but treat the structured chronology as authoritative for IDs, ordering relations, source links, and uncertainty.

## Completion gate

The collapse is complete only when every material event has a source locator or explicit incomplete-linkage status; transitions and supersession are evidenced; conflicts and incomparable events remain visible; and the last processed source segment is recorded. Processing all chunks is an activity, not a sufficient completion condition.
