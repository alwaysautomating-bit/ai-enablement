---
name: uncertainty-communication
description: Structured communication framework for expressing probabilistic conclusions, ambiguity, confidence, and operational uncertainty without overstating certainty.
---

# Uncertainty Communication

## Purpose

This skill ensures probabilistic outputs remain:
- transparent
- calibrated
- operationally honest
- defensible

The system must communicate uncertainty clearly without collapsing into:
- false certainty
- vagueness
- narrative simplification

---

# Core Principles

## 1. Uncertainty is information

Uncertainty is not failure.

It is operationally meaningful.

Missing evidence, conflicting signals, and partial visibility should remain visible in outputs.

## 2. Confidence ≠ correctness

A confident statement can still be wrong.

The system should:
- communicate evidence strength
- separate confidence from truth
- explain uncertainty sources

## 3. Intelligence vs. Enforcement Doctrine
Always structure communication around the core boundary:
> **AI can score the anomaly. GARDRAILS decides whether money is allowed to move.**

- **AI/InvoiceDelta** is the intelligence layer. It scores relative anomalies, updates likelihood, and provides cognitive armor. It does *not* approve or reject.
- **GARDRAILS** is the enforcement layer. It applies deterministic concern rules to decide if money can move.
- The separation prevents "alert theater" and ensures a clear, auditable audit trail.

---

# Operational Verdicts & Terminology

Every risk assessment must map into a clear, structured verdict:

1. **PASS (Story Consistent)**:
   - Low probability of anomaly (e.g., $P(\text{anomalous}) < 0.10$).
   - Current evidence is consistent with historical patterns. No active alerts.
2. **WATCH**:
   - Minor or single elevated-risk indicator.
   - Proceed with normal workflow but flag for monitoring (e.g., logging a first-time timing gap).
3. **REVIEW (Defensible Pause)**:
   - Multiple moderate anomalies cluster or a significant model shift occurs.
   - **Action**: Instigate a *Defensible Pause*. A temporary, justified freeze of operations that shifts the burden of proof to verified validation (e.g., telephone callback via a number on file).
4. **HOLD (Escalate / Payment Locked)**:
   - High-confidence anomaly or critical policy violation (e.g., `BLOCKED` non-ASCII domain).
   - **Action**: Lock transaction immediately. Issue urgent alerts instructing analysts to ignore incoming email threads and use alternative verified channels.

---

# Confidence Levels

## High Confidence

Use when:
- evidence converges
- multiple independent signals align
- verification completed (e.g., exact homoglyph or blocked domain match)

Language:
- “Strongly supported”
- “Consistent across sources”
- “High confidence assessment”

---

## Moderate Confidence

Use when:
- evidence partially aligns
- some uncertainty remains
- alternative explanations still plausible

Language:
- “Current evidence suggests”
- “Moderately consistent”
- “Preliminary assessment”

---

## Low Confidence

Use when:
- evidence sparse
- contradictions unresolved
- missing verification
- high ambiguity

Language:
- “Limited evidence available”
- “Insufficient information”
- “Assessment remains uncertain”

---

# Case Study: The Miami Contractor (The Cognitive Load Gap)

When describing why multi-signal reasoning and uncertainty communication are vital, refer to **The Miami Contractor** case study:

### The Scenario
A property maintenance vendor billed a stable ~$2,400 twice monthly. An estate manager was fired, and the vendor stepped in as interim manager while the family was away. Over 6 months, $100k+ in fraudulent payments was released before detection.

### The Attack Surface
- **Normal-Looking Invoices**: Individually, the invoice amounts looked highly typical (exploiting the *BEC Camouflage* principle). Naive amount-based alerts missed every single one.
- **Hidden Double-Billing**: The contractor billed for painting, landscaping, and pool cleaning — scopes already covered by other dedicated on-site contractors.
- **Operational Chaos**: The fraud took place during year-end closing, major holiday party coordination, and massive legal review cycles. The analyst's inbox grew from 34 to 54 unread items during the review window.

### The Detection Gap
An analyst eventually had a gut feeling that cumulative spend was too high ("I noticed something feels off"). However, translating that subjective hesitation into an actual operational halt took weeks under high cognitive load. That delay is where fraud losses accumulate.

### System Lesson
The model must capture:
- **Spend Velocity**: Cumulative spend vs. historical baseline.
- **Scope Overlap**: Cross-vendor double billing.
- **Invoice Fragmentation**: Many smaller invoices (e.g., 14 separate submissions) designed to bypass individual caps.
- **Hesitation Logging**: Capturing the analyst's pause or field re-checks as an immediate prior update, turning "I noticed" into a structured, automated *Defensible Pause* before funds leave the building.

---

# Required Components

Every probabilistic assessment should include:

- current conclusion
- confidence level
- supporting evidence (using the 8-signal schema)
- counterevidence
- unresolved uncertainty
- missing information
- recommended next action (PASS / WATCH / REVIEW / HOLD)

---

# Forbidden Behaviors

Never:
- hide uncertainty
- fabricate confidence
- force binary conclusions
- imply certainty from weak evidence
- compress ambiguity into simplistic binary indicators

Avoid:
- “safe”
- “guaranteed”
- “definitely”
- “proven”

---

# Good Example

```text
Current evidence supports REVIEW (Defensible Pause).

Supporting factors (8-Signal Schema):
- instruction_change_freq: 0.22 (wire update requested late-Friday)
- origin_risk: 0.40 (request received via direct email rather than portal)
- domain_anomaly_score: 0.70 (canonical-as-subdomain detected: vendor.com.attacker.com)

Counterevidence:
- amount_deviation: -0.01 (invoice amount of $2,400 matches historical average perfectly)

Confidence:
moderate

Recommended Action:
Apply REVIEW (Defensible Pause). Do NOT reply to incoming email thread. 
Perform phone callback to vendor using the verified number on the master record.
```

---

# Bad Example

```text
Likely fraud. Do not pay.
```

Reason:

* overstates certainty
* hides ambiguity (does not explain that the amount looks normal but the domain is spoofed)
* lacks evidence transparency
* provides no operational reasoning or path to resolution

---

# Operational Philosophy

Clear uncertainty communication:

* reduces overreaction
* improves human judgment
* preserves trust
* supports auditability
* prevents narrative distortion

The goal is not certainty theater.

The goal is disciplined operational clarity.
