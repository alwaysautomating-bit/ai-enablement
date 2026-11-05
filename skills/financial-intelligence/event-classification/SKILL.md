---
name: event-classification
description: Classify identified family-office events into useful planning categories for behavioral liquidity analysis. Use when candidate events have been identified and need consistent categorization across lifestyle, tax, investment, legal, property, staff or reimbursement, philanthropic, political, business or venture, oil-and-gas or asset, family milestone, emergency, or unknown classes.
---

# Purpose

Classify identified events into useful planning categories.

# What This Is

This is an upstream atomic skill for turning candidate events into consistent planning categories that can feed the canonical behavioral event map.

The categories supported in phase one are:

- lifestyle
- tax
- investment
- legal
- property
- staff/reimbursement
- philanthropic
- political
- business/venture
- oil-and-gas/asset
- family milestone
- emergency
- unknown

# What This Is Not

This is not:

- event discovery from scratch
- reserve planning
- scenario simulation
- executive volatility scoring
- a substitute for full event-map construction

It should not force categories when evidence is ambiguous.

# Inputs

Minimum inputs:

- candidate events from event identification
- family profile context

Helpful supporting inputs:

- source documents
- transaction context
- calendar context
- approval notes
- affected entity lists

# Outputs

Produce classified event records with:

- event name
- assigned category
- category rationale
- confidence
- ambiguous alternatives if needed
- evidence references
- notes for downstream event-map storage

# Reasoning Steps

1. Read the candidate event and its evidence.
2. Read the family profile context to understand source-of-wealth and operating context.
3. Determine the primary planning category based on the event's real operational meaning.
4. Prefer the category that best explains the burden created, not just the surface description.
5. When an event spans multiple categories, assign the primary category and record the secondary ambiguity in notes.
6. Use `unknown` when the event cannot yet be categorized responsibly.
7. Preserve client-specific nuance in the rationale.
8. Emit a classified event record suitable for the behavioral event map.

# Confidence Rules

Assign `high` confidence when:

- the event purpose is explicit
- the category is clearly supported by evidence
- there is little plausible category ambiguity

Assign `medium` confidence when:

- the category is likely but overlaps adjacent categories
- the event is understood but not fully documented

Assign `low` confidence when:

- the event meaning is unclear
- evidence is weak
- multiple categories are equally plausible

Use `unknown` when classification would otherwise be forced.

# Family-Office-Specific Notes

Family-office events often mix personal, operational, political, and entity-level activity.

Examples:

- a milestone birthday may be primarily `family milestone` even if it activates travel, staffing, and security spend
- a founder dinner may be `business/venture` even if it appears in a social calendar
- a conference retreat may be `business/venture`, `political`, or `lifestyle` depending on the real purpose
- a ranch equipment purchase may be `oil-and-gas/asset` or `property` depending on the underlying operating context

Source-of-wealth-aware classification matters.

Do not classify purely by spend label.

# Examples

## Example 1: Founder Retreat

Candidate event:

- annual retreat with founders, investors, and portfolio companies

Classification:

- category: business/venture
- rationale: the event is socially structured but primarily tied to venture network and investment ecosystem activity

## Example 2: Quarter-End Tax Transfer

Candidate event:

- estimated tax payment funding

Classification:

- category: tax
- rationale: the event is deadline-driven and tax-oriented even if it also creates liquidity urgency

## Example 3: Milestone Birthday Hosting

Candidate event:

- 60th birthday event with travel, security, and staffing coordination

Classification:

- category: family milestone
- rationale: the initiating driver is the family milestone, while operational sub-burdens should be captured in the event map notes

## Example 4: Drill Participation Commitment

Candidate event:

- election to participate in a drilling opportunity

Classification:

- category: oil-and-gas/asset
- rationale: the event is asset and project-driven within an oil-and-gas operating context

# Failure Modes

- classifying only from spend category labels
- ignoring source-of-wealth context
- using lifestyle as a catch-all for poorly understood events
- overcomplicating mixed events instead of choosing a primary category
- forcing precision when `unknown` is the honest answer

# Downstream Consumers

- behavioral event map
- event clustering or seasonal planning models
- later capabilities that require consistent event taxonomy
