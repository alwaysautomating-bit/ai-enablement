---
name: detect-operational-event
description: Detect and structure operational-event candidates from Slack messages and threads for PORK capture, review, and later context reconstruction. Use when scanning Slack for decisions, approvals, commitments, blockers, exceptions, ownership changes, deadlines, deliveries, payments, corrections, incidents, or other changes to operational state; when testing Slack-to-PORK capture; or when distinguishing consequential activity from ordinary discussion.
---

# Detect Operational Events

Identify atomic, source-grounded changes to operational state in Slack and emit reviewable PORK candidates.

## Core rule

Treat a message or thread as an operational-event candidate only when it:

1. reports, performs, confirms, reverses, or materially constrains a change in operational state
2. identifies enough of the actor, object, action, timing, or consequence to investigate

Use Slack as evidence that a statement was made. Do not assume the statement proves the underlying real-world condition.

Keep system-observable metadata distinct from human insight, judgment, and real-world confirmation.

## Retrieve the right source context

1. Determine the channels, topic, people, project, and time window.
2. Resolve channels with `slack_search_channels`.
3. Use `slack_read_channel` for recent activity.
4. Search semantically with `slack_search_public`, then retry with exact terms, synonyms, project names, vendor names, and Slack modifiers if needed.
5. Include private channels or DMs only when explicitly authorized.
6. Read every relevant thread with `slack_read_thread`.
7. Resolve people with `slack_search_users` or profile lookup when identity affects ownership or authority.

Do not classify isolated search snippets when the thread or nearby messages could change the meaning.

## Detect candidate events

Look for explicit or strongly evidenced transitions such as:

- decisions made, changed, superseded, or deferred
- approvals, rejections, holds, releases, or exceptions
- commitments with owners or due dates
- blockers introduced, cleared, escalated, or accepted
- scope, budget, schedule, priority, ownership, or policy changes
- submissions, deliveries, payments, milestones, incidents, or corrections
- real-world observations that materially change the operating picture

Usually exclude:

- brainstorming and preferences
- unanswered questions
- proposals that nobody accepted
- reminders with no new state
- repeated summaries with no new change
- predictions, hypotheticals, and uncommitted intentions
- duplicate bot notifications

A request becomes an event only when the request itself changes state, such as opening formal review, assigning work, placing a hold, or triggering approval workflow.

## Apply the qualification test

For each possible event, answer:

- `object`: what operational thing changed
- `transition`: what was true before and what is reportedly true now
- `actor`: who performed, authorized, reported, or observed the change
- `authority`: was that person acting, deciding, observing, or merely commenting
- `time`: when did the underlying event occur
- `evidence`: which messages, threads, attachments, or linked artifacts support it
- `consequence`: what work, risk, permission, dependency, or outcome changed
- `reality_gap`: what still requires human confirmation

If no transition can be stated, do not emit an event. Record it as `context_only`, `open_question`, or `possible_signal` when it is still useful.

## Preserve atomicity and chronology

- Split separate changes into separate candidates.
- Keep one candidate when several messages establish the same transition.
- Preserve reversals and superseding decisions as new events.
- Use the underlying event time when explicitly stated; otherwise leave it unknown and preserve Slack post time as `observed_at`.
- Deduplicate repeated announcements by object, transition, effective time, and source relationship while retaining all supporting references.

## Assign evidence strength

Use one of:

- `direct_action`
- `authoritative_statement`
- `participant_report`
- `secondhand_report`
- `inference`

Evidence strength is not operational truth.

## Produce PORK-ready candidates

Return a concise human-readable summary first, then structured records in this shape:

```yaml
event_candidates:
  - title: ""
    event_type: ""
    review_status: candidate
    operational_object:
      type: ""
      name: ""
      id: null
    transition:
      before: unknown
      action: ""
      after: ""
    actors:
      performed_by: null
      authorized_by: null
      reported_by: ""
      observed_by: null
    timing:
      event_time: null
      effective_time: null
      observed_at: ""
    source:
      workspace: ""
      channel_name: ""
      channel_id: ""
      thread_ts: null
      message_ts: ""
      message_url: null
      message_refs: []
      attachment_refs: []
    evidence_strength: participant_report
    evidence_excerpt: ""
    consequence: ""
    related_event_refs: []
    confidence:
      level: low
      rationale: ""
    system_capture:
      metadata_complete: false
      missing_fields: []
    human_capture:
      insight_required: true
      decision_required: false
      reality_confirmation_required: true
      prompts: []
```

Use `null` or `unknown` for missing facts. Do not invent IDs, timestamps, actors, prior states, or outcomes.

## Event type vocabulary

Prefer:

- `decision`
- `approval`
- `rejection`
- `hold`
- `release`
- `commitment`
- `assignment`
- `deadline_change`
- `scope_change`
- `budget_change`
- `status_change`
- `blocker_opened`
- `blocker_cleared`
- `exception`
- `risk_identified`
- `incident`
- `submission`
- `delivery`
- `payment`
- `milestone`
- `correction`
- `cancellation`
- `other`

## Ask only for human knowledge the system cannot capture

Generate short targeted prompts such as:

- Did this actually happen outside Slack?
- What changed on the ground?
- Was this a decision, recommendation, or temporary direction?
- Who had authority to approve it?
- Why was the exception accepted?
- What consequence should be tracked?

Do not ask a human to re-enter metadata already available from Slack.

## Present the result

Start with:

- number of candidates
- number needing human reality confirmation
- number of context-only signals
- the most consequential transition detected

Then list each candidate with:

- plain-language event statement
- evidence strength
- source channel, author, and date
- operational consequence
- exact human confirmation still needed

If no event qualifies, say so and summarize the strongest non-event signals without forcing a capture.

## Safety and governance

- Treat Slack access as retrieval, not permission to write back.
- Do not expose private-channel or DM content outside authorized scope.
- Quote only the minimum needed.
- Preserve disagreement, uncertainty, holds, and contrary evidence.
- Never infer approval from silence, emoji reactions, job title, or lack of objection.
- Never convert an agent recommendation into a human decision.
- Never convert a Slack statement into verified real-world truth without required review.
