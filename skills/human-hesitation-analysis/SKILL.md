---
name: human-hesitation-analysis
description: Analytical framework for tracking and modeling operator cognitive hesitation, structured pauses, and review patterns as first-class probabilistic evidence.
---

# Human Hesitation Analysis (Pause Capture)

## Purpose

This skill captures and quantifies operator cognitive hesitation as an active, first-class evidence signal in fraud detection and risk modeling. 

Most workflow systems treat the human operator as a passive step in a processing pipeline. This skill treats the human operator as a highly sensitive **pattern recognition sensor**. When an analyst pauses, checks a field twice, or hesitates, their sub-conscious is processing anomalies that standard rules engines often miss.

The goal is not surveillance.

The goal is capturing sub-conscious pattern recognition to protect the payment boundary.

---

# Core Principles

## 1. Hesitation is data
Cognitive hesitation represents pattern recognition operating below conscious articulation. A sudden pause is a signal that "something feels off," which often correlates with unseen or novel attack vectors.

## 2. Structured pauses vs. pipeline delays
A delay in processing should not automatically be treated as system inefficiency. When risk is elevated, a structured pause is a **Defensible Pause** — a protective action that shifts the burden of proof.

## 3. Cognitive load as an attack vector
Threat actors exploit busy periods (year-end closing, holiday events, high email volume) because they know cognitive load degrades pattern recognition. Hesitation analysis helps compensate for operator fatigue by flagging unusual review patterns when the analyst is under pressure.

---

# What We Measure (Pause Capture Metrics)

To model hesitation, systems must capture raw behavioral interactions during the review of an invoice packet:

1. **Review Duration ($t_{\text{review}}$)**: The total active time (seconds) spent focusing on an invoice packet before taking action.
2. **Field Re-Checks ($n_{\text{recheck}}$)**: The count of times an operator's cursor returns to a specific critical field (e.g., routing number, amount, domain name) during active review.
3. **Context Switches ($n_{\text{switch}}$)**: The count of times the operator leaves the active invoice review window to check external historical records, such as vendor payment history or wire version controls.
4. **Friction Events**: Double clicks, copy-paste attempts on un-selectable text, or repeated zooming on details.

---

# Mathematical Modeling of Hesitation (PyMC)

Operator review times are highly right-skewed and modeled using a **Lognormal distribution**:

$$\log(t_i) \sim \text{Normal}(\mu_i, \sigma_{\text{review}})$$

Where:
- $t_i$ is the observed review duration for invoice $i$.
- $\mu_i$ is the expected review log-time baseline, conditioned on the operator's historical speed, invoice complexity (e.g., number of pages), and vertical domain:
  $$\mu_i = \alpha_{\text{operator}} + \beta_{\text{complexity}} \cdot \text{complexity}_i$$
- $\sigma_{\text{review}}$ is the observation variance across the organization.

### Calculating the Hesitation Score (z-score)
For any active review session, compute the posterior hesitation z-score:

$$z_{\text{hesitation}} = \frac{\log(t_{\text{observed}}) - \mu_i}{\sigma_{\text{review}}}$$

### Verdict Mappings
The hesitation score maps directly to posterior update models:

| z-score Range | Classification | Meaning | Update Action |
|---|---|---|---|
| $z < 0.5$ | Consistent | Routine processing; matches baseline | Prior probability remains neutral |
| $0.5 \le z < 1.5$ | Watch | Slight hesitation or distraction | Minor upward shift in $P(\text{anomalous})$ |
| $z \ge 1.5$ | Anomalous Hesitation | Significant cognitive friction | Trigger immediate **Defensible Pause** |

---

# Behavioral Rules for Risk Systems

Always:
- log operator focus time transparently
- establish a stable, rolling historical baseline per operator before calculating z-scores
- treat hesitation as a likelihood update in a broader model, not as standalone proof of fraud

Never:
- use hesitation metrics for employee performance reviews or speed-up pressure
- auto-override a high-hesitation halt without documented callback verification
- ignore timing gaps when cognitive load is elevated (e.g., Friday late-afternoon submissions)

---

# Required Output Structure

```json
{
  "hesitation_analysis": {
    "observed_duration_seconds": 0.0,
    "expected_duration_seconds": 0.0,
    "z_score": 0.0,
    "rechecks_detected": [],
    "switches_detected": 0,
    "hesitation_verdict": "CONSISTENT | WATCH | ANOMALOUS_HESITATION",
    "defensible_pause_triggered": false
  }
}
```
