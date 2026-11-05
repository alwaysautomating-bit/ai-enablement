---
name: wire-risk-review
description: Operational doctrine for evaluating wire transfer requests before execution. Use whenever a wire is being considered, requested, or reviewed — especially under time pressure, executive involvement, or when behavioral anomalies are present. Covers urgency detection, email mismatch patterns, known scam structures, and acceptable verification methods. Trigger on any wire, ACH, EFT, or international payment request that requires a risk decision.
---

# Wire Risk Review Skill

Wires are irreversible. Every other payment type has a recovery mechanism. Wires do not. This asymmetry must be built into every decision.

**The default posture for any wire request with an anomaly is: hold until cleared, not proceed until stopped.**

---

## Risk Tier Classification

Classify every wire request before acting.

| Tier | Conditions | Response |
|---|---|---|
| **Tier 1 – Standard** | Known vendor, confirmed banking, no anomalies, within normal pattern | Proceed per standard approval workflow |
| **Tier 2 – Elevated** | New payee, changed banking, unusual amount, or timing anomaly | Verbal verification required before release |
| **Tier 3 – High** | Multiple anomalies, urgency framing, executive pressure, international destination | Full verification + secondary approval + 24hr hold |
| **Tier 4 – Critical** | BEC pattern detected, contact info conflict, unverifiable payee | Hard stop. Escalate. Do not proceed. |

---

## Urgency Detection

**Urgency is a red flag, not a reason to move faster.**

Legitimate vendors do not typically:
- Request same-day wires without prior notice
- Threaten consequences for payment delay
- Escalate through executive channels to bypass AP
- Request payment outside normal business hours with pressure language

When urgency is present, the correct response is to slow down and verify more thoroughly, not to accommodate the timeline.

### Urgency Language Patterns (High Alert)
- "We need this today or the deal falls through"
- "My boss said this is approved, just send it"
- "This is time-sensitive — can you skip the normal process just this once"
- "I'm traveling and need this handled immediately"
- "The CEO asked me to follow up on this personally"

Each of these patterns has appeared in confirmed fraud cases. Treat them as elevated risk signals regardless of who is saying them.

---

## Email Mismatch Patterns

Compare every wire request email against the vendor record.

### Common Spoofing Techniques
- Character substitution: `rn` instead of `m`, `0` instead of `O`
- Domain extension swap: `.net` instead of `.com`
- Subdomain insertion: `payments.vendor.com` instead of `vendor.com`
- Display name spoofing: name shows correctly, domain does not
- Reply-to manipulation: visible address differs from actual reply-to

**Never verify a wire using contact information from the email requesting the wire.** The verification call must go to the number in the vendor record.

---

## Friday Wire Caution Logic

Wire requests received on Friday afternoon or before a holiday carry elevated risk because:
- Less time to verify before the window closes
- Fraud actors exploit the "get it done before the weekend" pressure
- Recovery windows shrink significantly
- Escalation contacts may be unavailable

**Friday wires above threshold require same-day verbal confirmation or they wait until Monday.** Do not let calendar pressure override verification requirements.

---

## Behavioral Anomaly Checklist

Review before any Tier 2+ wire:

- [ ] Is this payee in the vendor record?
- [ ] Has this payee received a wire before?
- [ ] Is the amount within normal range for this vendor?
- [ ] Was this wire anticipated (PO, contract, milestone)?
- [ ] Is the destination account the same as prior payments?
- [ ] Is the requestor the normal contact for this vendor?
- [ ] Is the email domain an exact match to the vendor record?
- [ ] Was any urgency language used?
- [ ] Was any executive name invoked to apply pressure?

More than two NO answers = Tier 3 minimum.

---

## Eyeballs Protocol

For any Tier 3 or Tier 4 wire: a second human must review the request before release.

Requirements:
- The second reviewer must look at the original request independently
- They must confirm their review in writing (email, system note, or log entry)
- "I told them it was fine" verbally does not count
- The reviewer must have access to the vendor record, not just the invoice

This is not bureaucracy. It is the minimum viable protection for an irreversible transaction.

---

## Known Scam Structures

### CEO Fraud
Executive email (real or spoofed) requests urgent wire to unfamiliar account. Often claims confidentiality. Bypasses normal AP process by invoking authority.

**Response:** Verify with the executive via phone using a known number. Legitimate executives understand and support verification. Anyone who resists verification for a wire is a red flag regardless of title.

### Vendor Impersonation
Attacker compromises or spoofs a vendor email and requests a banking detail update before the next payment. Update looks routine. Money goes to fraud account.

**Response:** Banking changes require verbal confirmation + 48hr hold. No exceptions. The hold is the protection.

### Invoice Redirect
Legitimate invoice is intercepted or mimicked. Payment instructions are replaced. Everything else looks normal.

**Response:** Confirm banking details against vendor record on every wire, not just when something looks wrong. Fraud is designed to look normal.

### Construction/Draw Fraud
Funds requested for work not yet completed, subcontractors already paid elsewhere, or by entities not on the approved subcontractor list.

**Response:** See Construction Draw Review Skill.

---

## Documentation Requirements

Every wire, regardless of tier, must have:
- Payment amount and destination
- Authorizing approver (name + timestamp)
- Vendor record reference
- Invoice or supporting document

Tier 2+ additionally requires:
- Verbal verification log
- Anomaly notes (what was flagged and how it was resolved)

Tier 3+ additionally requires:
- Secondary reviewer sign-off
- Risk classification rationale

---

## Hard Stops

Do not release any wire if:
- Banking details cannot be confirmed against the vendor record
- Verbal verification was not completed for Tier 2+
- The requestor resists verification
- The payee is not in the vendor record and cannot be verified
- The destination account was changed within 30 days without a completed verification on record
