---
name: defensible-pause
description: Operational doctrine for intentionally slowing down, holding, or pausing a process — and doing it in a way that is logged, traceable, and legally defensible. Use when designing hold logic, exception workflows, or any system where a human needs to stop automated or expected flow and preserve the reasoning. Covers when to pause, how to document uncertainty, pause ownership, release conditions, and risk categorization. Trigger on hold logic, exception handling, review queues, escalation design, or any "what happens when we're not sure" scenario.
---

# Defensible Pause Skill

A pause that isn't documented didn't happen. A pause that can't be explained can't be defended. A pause with no release condition will turn into a permanent block.

**The defensible pause is not hesitation. It is a deliberate, logged, owned action with a clear path to resolution.**

---

## When to Pause

The correct default is to pause when any of the following are true:

- **Insufficient evidence**: The documentation doesn't support the action being requested
- **Anomaly detected**: Something about this transaction, entity, or request doesn't match the expected pattern
- **Threshold triggered**: A rule-based condition has been met (amount, vendor status, risk score)
- **Operator uncertainty**: The person responsible for the action is not confident
- **Missing verification**: A required check has not been completed
- **Time pressure anomaly**: The urgency of the request is disproportionate to the stakes

**Operator uncertainty is a valid pause trigger.** A system that punishes hesitation trains operators to suppress their instincts, which is how fraud succeeds.

---

## Pause Ownership

Every pause must have an owner — the person or role responsible for:
- Maintaining the pause
- Communicating its status to affected parties
- Resolving or escalating it
- Documenting the resolution

An unowned pause becomes a permanent block. Assign ownership at the moment the pause is created.

---

## Pause Documentation Requirements

At minimum, a pause record must contain:

| Field | Description |
|---|---|
| **Trigger** | What caused the pause (specific, not generic) |
| **Owner** | Who holds responsibility for resolution |
| **Timestamp** | When the pause was initiated (server-side, immutable) |
| **Affected entity** | What transaction, vendor, or process is paused |
| **Status** | Active / Escalated / Resolved / Overridden |
| **Release conditions** | What must be true for the pause to be lifted |
| **Resolution log** | What actually happened to resolve or close it |

### Optional but High Value
- **Operator note**: In the operator's own words, what made them uncertain
- **Duration at resolution**: How long the pause was active
- **Override flag**: If the pause was overridden rather than resolved, who overrode it and why

---

## The Pause Hesitation Log

A specialized capture for a specific moment: the operator hesitated before approving.

This is not a hold on the transaction. It is a record of the cognitive event.

**Why this matters:**
- Operators often feel pressure to approve rather than pause
- Hesitation that isn't captured disappears
- Patterns of hesitation across operators or transaction types are a fraud signal
- In a post-incident review, "I wasn't sure but I approved it anyway" is defensible if it was logged

**What to capture:**
- Timestamp of hesitation (when the operator paused on the action)
- Duration (how long they were on the approval screen before acting)
- Optional annotation (what specifically caused the uncertainty)
- Outcome (did they approve, hold, or escalate)

**Design implication:** Systems should make it easy to log "I'm not sure" without triggering a full formal hold. The low-friction hesitation log is different from the formal pause — it captures the signal without requiring the operator to initiate a process.

---

## Release Conditions

Every pause must have at least one release condition defined at creation. Without a release condition, a pause has no path to resolution.

### Release Condition Types

| Type | Description | Example |
|---|---|---|
| **Evidence receipt** | Specific document or confirmation received | Verbal audit completed and logged |
| **Time-based** | Automatic release after holding period | 48hr hold on banking change |
| **Approval-based** | Named approver must sign off | Controller approval required |
| **Threshold clearance** | Risk score drops below threshold | Vendor risk score recalculated |
| **External event** | Something outside the system must occur | Inspector report received |

Define release conditions in terms of observable, verifiable outcomes — not intentions or promises.

---

## Risk Categorization for Pauses

Not all pauses carry the same weight. Categorize at initiation:

| Category | Description | Escalation Threshold |
|---|---|---|
| **Routine Hold** | Standard verification pending | Resolve within 2 business days |
| **Elevated Hold** | Anomaly present, investigation needed | Escalate if unresolved after 48 hours |
| **Compliance Hold** | Regulatory or legal implication | Escalate immediately to compliance/legal |
| **Fraud Suspicion** | Active fraud pattern detected | Escalate immediately, notify appropriate parties |

Category determines who needs to know and how fast.

---

## Override Doctrine

Overrides happen. The question is whether they are documented or invisible.

### When an Override is Acceptable
- The pause trigger has been investigated and ruled out
- The approving authority is at or above the required level for the risk category
- The override rationale is captured in writing at the time of override
- The override does not remove the underlying hold condition from the system record

### When an Override is Not Acceptable
- The pause was never documented in the first place
- The override is verbal only
- The override is issued by someone below the required authority level
- The override is issued under time pressure without review

**An undocumented override is an invisible risk.** If it goes wrong, there is no record that a flag was present, which means there is no record that the organization had the information to stop the harm.

---

## Pause vs. Rejection

A pause implies resolution is possible. A rejection means the request does not meet the minimum standard to proceed, regardless of what additional information is provided.

Use rejection (not pause) when:
- The request is structurally fraudulent (contact information from invoice, fabricated documentation)
- The entity is permanently disqualified
- The action being requested violates a hard policy that cannot be overridden

Use pause when:
- Evidence is incomplete but could be obtained
- Verification is required but not yet completed
- The risk is elevated but not disqualifying

---

## Designing Systems Around the Defensible Pause

When building systems that involve human approval flows:

- **Make pausing as easy as approving.** If the hold action requires more steps than approval, operators will approve rather than pause.
- **Surface the pause log in review screens.** Auditors and reviewers need to see the full pause history, not just the current status.
- **Never auto-release a pause.** Time-based releases should move to a review queue, not auto-approve.
- **Show operators the release conditions.** They should know what they are waiting for, not just that they are waiting.
- **Log hesitation separately from formal holds.** Low friction hesitation capture = better fraud pattern data over time.
