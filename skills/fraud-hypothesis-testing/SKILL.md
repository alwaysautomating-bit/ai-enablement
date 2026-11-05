---
name: fraud-hypothesis-testing
description: Operational fraud-risk inference framework using Bayesian reasoning, behavioral anomalies, identity verification, and contextual evidence weighting.
---

# Fraud Hypothesis Testing

## Purpose

This skill evaluates whether operational activity is:
- legitimate
- suspicious
- manipulated
- compromised
- socially engineered
- fraudulent

The goal is not accusation.

The goal is defensible risk assessment.

---

# Core Doctrine

## 1. Zero Trust Identity
Money does not move until identity is confirmed against the trusted vendor record.

No verified identity → no approval.

Operational safety is more important than workflow speed.

## 2. Wide Capture, Narrow Authority
Intake pathways (such as QR codes or field capture apps) must follow the **Wide Capture, Narrow Authority** architecture:
- **Wide Capture (Low/No Friction)**: Field personnel and external contractors can submit photos, notes, and delivery evidence without credentials or complex accounts (e.g., using signed, single-purpose, expiring QR tokens).
- **Narrow Authority (High Security)**: No intake path can ever trigger automated payments or change orders. Authority actions (releasing funds, vendor activation, gate overrides) must remain authenticated, role-governed, and fully audited.
- **The Human Gap**: The gap between evidence intake and consequence is always occupied by a documented human decision.

---

# Evaluation Categories & The 8-Signal Schema

Rather than relying on naive thresholds, risk must be modeled using the **8-Signal Schema**:

## 1. Identity Integrity (3 Core Signals)
- **`routing_days_risk`**: The age of the routing number. Routing numbers active for $< 45$ days (or routing_days_risk $> 0.877$) represent elevated risk.
- **`origin_risk`**: The intake channel. Requests received outside secure portals (or origin_risk $> 0.333$) present elevated risk.
- **`domain_anomaly_score`**: The domain legitimacy score, derived from a rigorous 10-step domain analysis pipeline.

### The 10-Step Domain Anomaly Pipeline
Every email domain must pass through the following sequential evaluations to compute a domain anomaly score:
1. **Non-ASCII / Cyrillic Character Check** → Immediate `BLOCKED` (Score: 1.0)
2. **Allowlist Match** (Exact match on verified domain) → `CLEAN` (Score: 0.0)
3. **Cold Start** (Newly registered or never-before-seen domain) → `UNKNOWN` (Score: 0.3)
4. **Homoglyph Detection** (Character lookalikes like `vvendor.com` or `vëndor.com`) → `SUSPICIOUS` (Score: 0.95)
5. **Edit Distance = 1** (One character added, deleted, or substituted) → `SUSPICIOUS` (Score: 0.95)
6. **Edit Distance = 2** (Two character mutations) → `SUSPICIOUS` (Score: 0.70)
7. **Unverified Subdomain** (e.g., `vendor.legitdomain.com` without verification) → `UNKNOWN` (Score: 0.3)
8. **TLD Manipulation** (e.g., `vendor.co` instead of `vendor.com`) → `SUSPICIOUS` (Score: 0.70)
9. **Canonical-as-Subdomain** (e.g., `legitdomain.com.attacker.com`) → `SUSPICIOUS` (Score: 0.70)
10. **Hyphen-Append Manipulation** (e.g., `vendor-support.com` instead of `vendor.com`) → `SUSPICIOUS` (Score: 0.70)
- *Fallback*: Any unrecognized domain defaults to `UNKNOWN` (Score: 0.3).

---

## 2. Payment Path Verification (2 Core Signals)
- **`vendor_tenure_risk`**: The duration of the active vendor relationship relative to historical baselines.
- **`instruction_change_freq`**: The frequency of wire or payment routing instruction changes. High frequency (or instruction_change_freq $> 0.199$) is heavily penalized.

### High-Risk Timing & Pressure
- Late-Friday routing updates designed to exploit weekend batch delays.
- Escalation bypasses (demanding immediate action from senior executives to bypass standard AP analysts).

---

## 3. Behavioral Pattern Analysis (2 Core Signals)
- **`corroboration_deficit`**: The gap in backing documents (e.g., fewer than 3 corroborating files or corroboration_deficit $> 0.625$).
- **`contradictory_signal`**: Conflicting data points inside the packet (contradictory_signal $> 0.500$).

### Operator Hesitation (Pause Capture)
Operator review speed, field re-check patterns, and structured pause duration are treated as high-value data points. Cognitive hesitation indicates pattern recognition firing below conscious analysis and must be logged.

---

## 4. Contextual Cross-Checks (1 Core Signal)
- **`amount_deviation`**: The deviation of the transaction amount from the vendor's historical baseline.

### The BEC Camouflage Principle
> [!WARNING]
> **BEC Camouflage**: Business Email Compromise (BEC) fraud amounts look *more normal* than legitimate transactions. In active attacks, the posterior mean for `amount_deviation` is frequently near zero (e.g., $-0.02$).
> Naive rules-based engines that flag high amounts will miss 70%+ of real fraud. A robust model must prioritize identity and narrative signals over raw transaction size.

---

# The Identity → Quality Delta (IQD) Framework

To evaluate the operational success of risk assessment systems, calculate the **Delta Score**:
$$\text{Delta Score} = w_Q Q + w_T T + w_E E$$

Where:
- **Quality ($Q$)**: Correctness of the payment decision and fraud prevention outcome.
- **Time ($T$)**: Operational speed relative to baseline.
- **Effort ($E$)**: Cognitive load and operator manual effort relative to baseline.
- *Scoring*: Each dimension is scored $-1$, $0$, or $+1$.
- *Rollout Value*: $\text{Delta Score} \times \text{Adoption Rate}$

### Vertical Configurations
Weights ($w_Q, w_T, w_E$) must adjust based on the specific vertical and its risk tolerances:

| Vertical | Weight Formula | Rationale |
|---|---|---|
| **SYNCD AP / Wealth** | $(2 \times Q) + T + E$ | False negatives are catastrophic; quality dominates completely. |
| **High-Volume Construction AP** | $Q + (2 \times T) + E$ | Draw schedule pressure requires high throughput and speed. |
| **Effort-Burnout Operations** | $Q + T + (2 \times E)$ | Operator fatigue is the primary threat to security; minimize cognitive load. |

---

# Risk Escalation & Human Review Triggers

Mandatory human review and immediate **DEFENSIBLE PAUSE** are triggered when:
- **Domain Anomaly is `BLOCKED`**: Immediate `HOLD` applied to the vendor record.
- **GARDRAILS Concern Rules Exceeded**:
  - `routing_days_risk` $> 0.877$ (routing age $< 45$ days)
  - `origin_risk` $> 0.333$ (unsecured intake channel)
  - `instruction_change_freq` $> 0.199$ (frequent routing updates)
  - `corroboration_deficit` $> 0.625$ (fewer than 3 backing items)
  - `contradictory_signal` $> 0.500$ (contradictions in data)
  - `domain_anomaly_score` $> 0.000$ (any domain anomaly detected)

The system must never auto-approve or auto-override elevated-risk alerts.

---

# Output Requirements

Preferred output:

```json
{
  "risk_assessment": "PASS | WATCH | REVIEW | HOLD",
  "confidence": "low | moderate | high",
  "primary_risk_drivers": [],
  "counterevidence": [],
  "identity_status": "CLEAN | UNKNOWN | SUSPICIOUS | BLOCKED",
  "verification_status": "UNVERIFIED | VERIFIED_CALLBACK_REQUIRED | CRYPTOGRAPHICALLY_VERIFIED",
  "delta_score": { "Q": 0, "T": 0, "E": 0, "composite": 0 },
  "recommended_action": "",
  "approval_blocked": true,
  "human_review_required": true
}
```

---

# Language Rules

Avoid:

* “This is definitely fraud.”
* “The vendor is malicious.”

Prefer:

* “Observed anomalies materially increase risk.”
* “Verification remains incomplete.”
* “Evidence supports escalation.”

---

# Operational Philosophy

Fraud prevention is:

* evidence preservation
* disciplined verification
* consequence-aware operations
* controlled uncertainty management

The objective is not speed.

The objective is trustworthy movement of money.
