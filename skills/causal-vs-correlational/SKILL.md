---
name: causal-vs-correlational
description: Foundational framework for implementing Directed Acyclic Graphs (DAGs) and Bayesian Networks to separate correlation from causation, generating plain-language causal explanations for risk verdicts.
---

# Causal vs. Correlational (DAGs & Explanation Engines)

## Purpose

This skill establishes the standards for evaluating causal networks inside risk assessment engines. 

Standard classification models calculate correlations between signals and outcomes, which leads to two critical failures: operators ignore alerts they cannot explain, or they over-trust scores because of "AI authority." This skill implements **Bayesian Networks (DAGs)** to map logical, structural dependencies, allowing the system to isolate actual root causes and explain *why* a score is elevated in plain language.

The goal is to eliminate alert theater and provide cognitive armor to the human analyst.

---

# Causal Directed Acyclic Graph (DAG) Structure

To model the true generative story of an operational anomaly, we represent dependencies through a DAG where **latent parent nodes** (unobserved root causes) causally generate **observed leaf nodes** (our 8-signal schema):

```
       [ Latent Root Causes ]                      [ Observed Signals ]
  ┌──────────────────────────────┐              ┌────────────────────────┐
  │                              │              │                        │
  │  (C1) Compromised Credentials├─────────────►│(S1) Domain Anomaly Score│
  │                              │──┐           │                        │
  └──────────────────────────────┘  │           └────────────────────────┘
                                    └──────────►┌────────────────────────┐
  ┌──────────────────────────────┐              │                        │
  │                              ├─────────────►│(S2) Request Origin Risk│
  │  (C2) Vendor Impersonation   │──┐           │                        │
  │                              │  │           └────────────────────────┘
  └──────────────────────────────┘  │           ┌────────────────────────┐
                                    │  ┌───────►│(S3) Routing Days Risk  │
                                    │  │        │                        │
                                    │  │        └────────────────────────┘
                                    │  │        ┌────────────────────────┐
                                    └──┼───────►│(S4) Corroboration Defic│
                                       │        │                        │
  ┌──────────────────────────────┐     │        └────────────────────────┘
  │                              ├─────┘        ┌────────────────────────┐
  │  (C3) Clerical Error         ├─────────────►│(S5) Contradictory Signa│
  │                              │              │                        │
  └──────────────────────────────┘              └────────────────────────┘
```

## Latent Root Causes (Parent Nodes)
- **$C_1$ (Compromised Credentials)**: A threat actor has access to a legitimate user's portal or email account.
- **$C_2$ (Vendor Impersonation)**: An external attacker is pretending to be a vendor (e.g., domain spoofing).
- **$C_3$ (Clerical Error)**: A legitimate vendor or internal operator made a simple manual data entry mistake.

---

# Mathematical Inference of Root Causes

When a risk score increases, we perform inference over the network to calculate the posterior probability of each latent cause given the active set of observed signals $S$:

$$P(C_i \mid S_1, S_2, \dots, S_n) = \frac{P(S_1, \dots, S_n \mid C_i) P(C_i)}{\sum_{j=1}^M P(S_1, \dots, S_n \mid C_j) P(C_j)}$$

Where:
- $P(C_i)$ is the prior probability of each latent cause (e.g., $P(\text{Clerical Error}) \gg P(\text{Impersonation})$).
- $P(S \mid C_i)$ is the conditional probability of observing the signal pattern given that specific cause.

## Disentangling Clashing Hypotheses
- **Scenario A (Impersonation)**:
  * *Observed*: `domain_anomaly_score` $= 0.95$ and `routing_days_risk` $= 0.88$.
  * *Inference*: The homoglyph and new routing account point strongly toward $C_2$ (Vendor Impersonation). The posterior probability $P(C_2 \mid S)$ approach $0.99$.
- **Scenario B (Clerical Error)**:
  * *Observed*: `routing_days_risk` $= 0.88$ (new routing number) but `domain_anomaly_score` $= 0.00$ (clean domain) and `corroboration_deficit` $= 0.00$ (complete document trail).
  * *Inference*: Despite the new routing number, the complete lack of domain spoofing or corroboration gaps points to $C_3$ (Clerical Error). The system alerts the analyst of a new account but avoids high-severity fraud holds.

---

# Generating Causal Explanations (The Explanation Layer)

To translate computed posteriors into clear, actionable advice for the operator, the system must generate plain-language explanations that compare competing hypotheses:

## Rationale Standard Template
1. **The Verdict**: High-level action trigger (PASS / WATCH / REVIEW / HOLD).
2. **The Dominant Cause**: The latent node with the highest posterior probability.
3. **Evidence Contrast**: Explicitly states what supported the verdict and what counterevidence was present (e.g. comparing the amount vs. the domain).
4. **Resolution Pathway**: Actionable verification steps.

### Good Causal Output Example
> **Verdict: REVIEW (Defensible Pause)**
> 
> *   **Primary Driver**: High probability of **Vendor Impersonation** ($P = 0.94$).
> *   **Causal Rationale**: A new routing account number was submitted late-Friday afternoon ($routing\_days\_risk > 0.87$). While the invoice dollar amount matches the historical average perfectly ($amount\_deviation = -0.01$, indicating high BEC camouflage), the email domain carries a character substitution homoglyph ($domain\_anomaly\_score = 0.95$).
> *   **Counter-Hypothesis**: The probability of a simple Clerical Error is extremely low ($P < 0.05$) due to the coordinated domain manipulation.
> *   **Action**: payment LOCKED. Do NOT reply to the email thread. Perform a telephone callback to the verified number on the master record.

---

# Required Output Structure

```json
{
  "causal_inference": {
    "latent_posteriors": {
      "compromised_credentials": 0.0,
      "vendor_impersonation": 0.0,
      "clerical_error": 0.0
    },
    "dominant_cause": "COMPROMISED_CREDENTIALS | VENDOR_IMPERSONATION | CLERICAL_ERROR",
    "causal_explanation": "",
    "counter_hypothesis_probability": 0.0
  }
}
```
