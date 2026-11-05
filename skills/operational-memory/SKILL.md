---
name: operational-memory
description: Framework for preserving, structuring, and retrieving organizational memory — decisions, context, evidence, and operational events — in a way that survives personnel changes, time gaps, and audit scrutiny. Use whenever designing how a system should store context, when a decision needs to be traceable, when reconstructing a timeline, or when building any feature that involves logging, history, notes, or institutional knowledge. Trigger on audit trails, decision logs, context preservation, traceability, or any "how do we remember this" task.
---

# Operational Memory Skill

Organizations forget. People leave. Context evaporates. The only protection is intentional memory architecture built before you need it.

**Operational memory is not documentation for its own sake. It is the ability to reconstruct why a decision was made, by whom, with what information, at what point in time.**

---

## Core Principle

Every consequential operational event should produce a record that answers:

1. **What happened?** (the event)
2. **Who acted?** (the actor)
3. **When?** (timestamp — immutable)
4. **Why?** (the rationale or trigger)
5. **What was the state at the time?** (snapshot of relevant context)
6. **What was the outcome?** (result or next state)

If a record cannot answer these six questions, it is incomplete.

---

## Memory Architecture Layers

### Layer 1: Event Log (Immutable)
Raw operational events. Should never be edited or deleted.
- Timestamps in UTC
- Actor ID (user, system, or integration)
- Event type (categorized)
- Payload (what changed or what was recorded)

### Layer 2: Decision Record
Human-authored context attached to significant decisions.
- What was the decision?
- What options were considered?
- What evidence was available?
- Who approved?
- What was the expected outcome?

### Layer 3: Operational Notes
Contextual annotations that don't fit event structure.
- Analyst observations
- Vendor communication summaries
- Exception rationale
- "Why we didn't do X" notes

### Layer 4: Reconstructed Timeline
Assembled view across layers for audit, review, or dispute resolution.
- Chronological ordering of events + decisions + notes
- Linked artifacts (invoices, emails, photos, call logs)
- Gap identification (what's missing from the record)

---

## What Operational Events Matter

Not everything needs to be logged. These do:

**Financial operations:**
- Payment approvals and the approver
- Payment holds and the hold reason
- Banking detail changes
- Exceptions to standard workflow
- Threshold overrides

**Vendor/entity management:**
- Onboarding events
- Risk score changes
- Communication that affects trust status
- Disputes and resolutions

**Human decisions under uncertainty:**
- Any time a human chose to proceed despite a flag
- Any time a human chose to pause
- Any escalation and its outcome
- Any time a standard was waived and why

---

## Context Preservation Standards

### What to Capture at Decision Time
Capture context *at the moment of the decision*, not reconstructed later. Later reconstruction is interpretation, not evidence.

- The information available at decision time (not information discovered afterward)
- The specific flag or trigger that prompted the decision
- The reasoning in the actor's own words if possible

### Immutability Requirements
Operational logs must be:
- Append-only (no editing, no deleting)
- Timestamped at creation (server-side, not client-side)
- Actor-attributed (who created the record)
- Linked to the relevant entity (invoice, vendor, payment)

**A log entry that can be edited is not evidence. It is a document.**

### Soft Delete Doctrine
Operational records are never hard-deleted. Deletion events are themselves logged. The record of "this was removed" must be preserved even if the content is suppressed.

---

## Knowledge Fragmentation Patterns (Anti-Patterns)

These patterns destroy operational memory:

| Pattern | Description | Consequence |
|---|---|---|
| **Tribal knowledge** | Critical context lives only in someone's head | Context leaves when the person does |
| **Email as record** | Decisions made via email with no system capture | Unretrievable, unsearchable, deletable |
| **Verbal approval** | "They said it was fine" with no written record | Unverifiable, disputed in audit |
| **Retroactive documentation** | Notes written after the fact to explain a decision | Not evidence, creates legal risk |
| **Orphaned records** | Logs exist but aren't linked to the entities they describe | Untraceable during reconstruction |
| **Context collapse** | Status captured without the reasoning | Can't explain why something was approved |

---

## Timeline Reconstruction Logic

When reconstructing an operational timeline (for audit, dispute, or review):

1. **Anchor to the event log** — start with immutable timestamps, not narratives
2. **Layer in decision records** — what was decided and when
3. **Add contextual notes** — what was observed or communicated
4. **Identify gaps** — what periods have no record? What decisions have no rationale?
5. **Flag anomalies** — timestamps out of sequence, records created after decisions they purport to explain
6. **Produce a narrative** — synthesize into human-readable form with evidence citations

Gaps in a timeline are findings, not just missing data. Document what is absent and why it matters.

---

## Traceability Standards

A system has adequate operational memory if you can answer these questions without calling anyone:

- Who approved this payment and when?
- What information did they have at the time of approval?
- Was any flag raised during this transaction? How was it resolved?
- When was this vendor's banking information last changed?
- Who changed it? Was it verified?
- Has this vendor ever had a payment hold? Why?

If any of these require a phone call or an email search rather than a system query, the memory architecture is insufficient.

---

## Application to AI-Assisted Systems

When building AI-assisted workflows, operational memory becomes more critical, not less:

- AI decisions and the inputs that produced them must be logged
- Model version or prompt version should be captured with AI-generated outputs
- Human overrides of AI recommendations must be logged with rationale
- Confidence scores and thresholds used in automated decisions must be preserved

**"The AI approved it" is not an audit trail. The AI's inputs, output, confidence, and the human who accepted the result — that is an audit trail.**
