---
name: operator-communication
description: UI/UX and communication doctrine for systems used by operators — people doing real work under real pressure. Use when designing interfaces, writing system messages, error states, alerts, notifications, confirmation flows, or any copy that an operator will see while doing their job. Covers clarity over performance, cognitive load reduction, action framing, alert design, and the specific ways operators differ from general users. Trigger on any UI copy, system message, alert design, workflow language, or operator-facing communication task.
---

# Operator Communication Skill

An operator is not a user exploring a product. They are a person with a job to do, a queue to clear, and consequences if they get it wrong. Every word in the interface either helps or gets in the way.

**The goal is not to communicate. It is to enable accurate action with minimum cognitive overhead.**

---

## Core Principles

### Clarity Over Performance
System messages are not marketing. They do not need to be clever, warm, or branded. They need to be understood correctly on the first read, under pressure, possibly on a small screen.

Do not write: *"Looks like there's a small issue we need to sort out before proceeding!"*
Write: *"Banking details unverified. Payment held."*

### Direct Language
State the condition. State the action. Stop.
- What is the current state?
- What does the operator need to do?
- What happens if they don't?

Three sentences maximum for any alert or instruction. If you need more, the problem is the design, not the copy.

### Low Cognitive Overhead
Operators are context-switching constantly. Every interaction that requires them to think, remember, or figure something out is a failure of the interface.

Design for the version of the operator who is:
- On their fourth hour of a queue
- Getting an IM from someone while they're reading this
- Already behind on approvals
- Slightly skeptical of the system

That version is your actual user.

### One Primary Action
Every screen, message, and alert should have exactly one primary action. If there are three things the operator could do, you haven't designed the interface — you've handed the problem to the operator.

Operators should never have to decide what to do next. The system should tell them.

---

## Alert Design Doctrine

### No Alert Theater
Alert theater: generating alerts that look important but don't require action and cannot be acted on.

Alert theater trains operators to ignore alerts. This is catastrophic in a high-consequence system.

**Every alert must:**
- Describe a specific, actionable condition
- Have a clear owner (who needs to act on this)
- Have a clear action (what should happen next)
- Resolve when the condition is resolved

**Alerts that should not exist:**
- Informational alerts that appear in the same visual register as actionable alerts
- Alerts for events the operator cannot influence
- Repeated alerts for the same unresolved condition without escalation logic
- Alerts that disappear without requiring acknowledgment when acknowledgment matters

### Alert Hierarchy
Use visual hierarchy to reflect actual urgency:

| Level | Condition | Design |
|---|---|---|
| **Critical** | Action required to prevent harm or release a hard block | High contrast, non-dismissable until resolved |
| **Warning** | Anomaly present, review recommended | Visible, dismissable with logged acknowledgment |
| **Informational** | Status update, no action required | Low visual weight, auto-dismissing acceptable |

Never use critical styling for informational content. Never bury a critical alert in a low-weight container.

---

## Non-Dismissable Warning Standard

Some warnings must not be dismissable without a deliberate action.

Use non-dismissable warnings when:
- The operator is about to take an irreversible action
- A fraud signal is present and the operator is about to approve anyway
- A verification step has been skipped and payment is being released

The non-dismissable warning is not a popup that requires clicking OK. It is a state the system is in until a specific condition is met or a deliberate override is logged.

**Example application:** When a vendor has no verified banking details, the Approve & Close button should be disabled — not warned about — until banking is verified. When a risk score is at or above threshold, the approval path should require explicit override with a logged rationale.

---

## Confirmation Flow Design

Confirmation prompts are not friction. They are a cognitive interrupt. Use them deliberately.

### When to Use Confirmation
- Irreversible actions (wire release, permanent deletion, status change with downstream effects)
- Actions that override a flag or hold
- Actions where the consequence is significantly larger than the action itself

### When Not to Use Confirmation
- Reversible actions the operator takes dozens of times a day
- Routine approvals within normal parameters
- Navigation or view changes

**Confirmation fatigue is real.** Operators who confirm 40 things a day stop reading the confirmation prompts. Reserve confirmations for the moments that require them.

### Confirmation Copy Standard
State what will happen, not what the operator is doing.

Don't write: *"Are you sure you want to approve this payment?"*
Write: *"This will release $47,200 to First National Bank (account ending 4821). This action cannot be undone."*

The operator already knows they want to approve the payment. They need to know what approving actually does.

---

## Error State Design

### Error messages must answer:
1. What went wrong (specific, not generic)
2. What the operator should do next (one action)
3. Whether their previous action was preserved (yes or no, clearly stated)

Don't write: *"Something went wrong. Please try again."*
Write: *"Payment could not be submitted — connection lost. Your entries were saved. Try again or contact support."*

### Error states that should never appear:
- Generic "something went wrong" with no specificity
- Errors that clear the form without preserving input
- Errors that don't distinguish between "your action failed" and "the system failed"
- Errors in technical language that operators cannot act on

---

## Respecting Operator Intelligence

Operators are not naive. They understand their domain. Interface copy that over-explains, hedges excessively, or treats the operator as someone who might not understand is:
- Slower to read
- Condescending in effect
- More likely to be skimmed past

Trust the operator to understand what their job requires. Give them the information they need. Don't give them information they don't need.

**What operators need:** Facts, status, action, consequence.
**What operators don't need:** Context they already have, reassurance that the system is working on it, branded warmth injected into workflow messages.

---

## Language Patterns

### Prefer active over passive
- ✓ "Payment held — banking details unverified"
- ✗ "This payment has been placed on hold pending verification of banking details"

### Prefer specific over general
- ✓ "Vendor banking not verified. Complete verbal audit to release."
- ✗ "Additional verification may be required"

### Use the operator's vocabulary
- Use the terms your operators use in their actual work
- If they call it a "draw request," the interface calls it a "draw request"
- If they call it "cutting a check," match that register
- Never use product feature names when the operational term is clearer

### State conditions, not feelings
- ✓ "3 invoices pending review"
- ✗ "You're almost caught up! Just 3 more invoices to go 🎉"

---

## Summary Checklist for Operator-Facing Copy

Before shipping any interface copy that operators will see:

- [ ] Does it state the current condition in plain terms?
- [ ] Is there exactly one primary action (if action is required)?
- [ ] Is the consequence of the action stated if it's irreversible or significant?
- [ ] Is it free of unnecessary warmth, hedging, or performance?
- [ ] Does it use the operator's vocabulary?
- [ ] Would it be clear to an operator in their fourth hour of a queue?
- [ ] If it's an alert, does it have a resolution state?
- [ ] If it's a confirmation, is it reserved for something that actually requires interruption?
