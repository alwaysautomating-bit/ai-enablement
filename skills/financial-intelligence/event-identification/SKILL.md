---
name: event-identification
description: Identify events that may create financial, liquidity, approval, operational, or attention burden in a family-office environment. Use when turning notes, calendars, transactions, or operator memory into candidate events for behavioral liquidity planning, including recurring, one-time, seasonal, deadline-driven, behavior-driven, and source-of-wealth-specific events.
---

# Purpose

Identify candidate events that may create financial, liquidity, approval, operational, or attention burden.

# What This Is

This is an upstream atomic skill for finding event candidates before they are classified or turned into a canonical event map.

It should scan family-office material for events such as:

- recurring events
- one-time events
- seasonal events
- deadline-driven events
- behavior-driven events
- source-of-wealth-specific events

This skill should produce candidate event objects or candidate event notes that downstream consumers can review and classify.

# What This Is Not

This is not:

- full event classification
- reserve planning
- Monte Carlo modeling
- executive scoring
- final behavioral reserve analysis

It should not calculate reserve math or simulate outcomes.

# Inputs

Minimum inputs:

- family profile context
- one or more source artifacts

Possible source artifacts:

- notes
- calendars
- transaction history
- approvals
- reimbursement logs
- project trackers
- travel plans
- gifting trackers
- event lists
- operator memory summaries

Helpful supporting inputs:

- affected entity list
- prior event maps
- source-of-wealth guidance

# Outputs

Produce a set of candidate events with enough structure for downstream classification and event-map materialization.

Minimum output attributes should include:

- candidate event name
- probable trigger or cause
- likely recurrence shape
- likely calendar window
- likely source human or group
- likely affected entities
- suspected burden types
- confidence
- evidence references
- open questions

# Reasoning Steps

1. Read the family profile context first.
2. Anchor on client-specific behavior, not generic UHNW assumptions.
3. Scan the source artifacts for explicit event mentions.
4. Scan for implicit events hidden inside approvals, transactions, travel, reimbursements, or repeated coordination patterns.
5. Detect recurring patterns across time.
6. Detect one-time but material events that still create burden.
7. Detect seasonal or calendar-based patterns.
8. Detect deadline-driven patterns such as taxes, gifting cutoffs, board meetings, or filing windows.
9. Detect behavior-driven patterns such as opportunistic investing, last-minute hosting, or rapid deployment requests.
10. Detect source-of-wealth-specific patterns that match the family profile and are supported by evidence.
11. Note likely burden types:
    - financial
    - liquidity
    - approval
    - operational
    - attention
12. Preserve ambiguity when evidence is incomplete.
13. Emit candidate events for downstream classification.

# Confidence Rules

Assign `high` confidence when:

- the event is explicit in records
- the recurrence or timing is well-supported
- the source human or group is clear

Assign `medium` confidence when:

- the event is likely but partially inferred
- timing or recurrence is reasonably supported
- some event burden is clear but details remain incomplete

Assign `low` confidence when:

- the event is speculative
- the event may be a one-off artifact rather than a real planning object
- source, timing, or burden are poorly supported

Use `unknown` or open questions when needed instead of forcing certainty.

# Family-Office-Specific Notes

Family-office events are not limited to obvious spend categories.

An event may matter because it creates:

- liquidity demand
- approval churn
- staff coordination load
- reputational exposure
- principal interruption

Source of wealth should guide scanning.

Examples:

- venture-capital families may produce capital calls, SPVs, founder events, political events, and conference cycles
- oil-and-gas families may produce ranch operations, land acquisitions, drilling commitments, equipment purchases, and estate-planning coordination

Use these patterns as guidance, not as stereotypes.

# Examples

## Example 1: Venture-Style Family

Inputs:

- family profile shows venture-capital background
- calendar contains annual conference clusters
- notes mention founder dinners
- transaction history shows recurring SPV wires

Candidate events:

- founder conference cycle
- SPV deployment window
- political fundraising season

## Example 2: Oil-And-Gas Family

Inputs:

- family profile shows ranch and mineral-rights activity
- operator notes mention spring equipment spend
- legal notes mention estate review cycle

Candidate events:

- spring ranch operations season
- drilling commitment window
- annual estate planning review

## Example 3: Lifestyle Event

Inputs:

- travel tracker
- milestone birthday note
- staffing coordination emails

Candidate events:

- milestone birthday event
- associated travel and hosting cascade

# Failure Modes

- treating transactions as the only signal and missing operational events
- assuming one family behaves like another family with similar wealth
- collapsing distinct events into one vague category
- confusing one-time noise with durable patterns
- over-inferring source-of-wealth patterns without evidence
- missing attention burden because dollar spend appears modest

# Downstream Consumers

- event classification
- behavioral event map
- calendar-based behavioral liquidity planning models
- later capabilities that depend on accurate event structure
