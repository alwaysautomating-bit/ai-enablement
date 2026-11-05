---
name: bayesian-core
description: Foundational probabilistic reasoning framework for evidence evaluation, uncertainty handling, posterior updates, and operational inference.
---

# Bayesian Core

## Purpose

This skill provides disciplined probabilistic reasoning for environments with:
- incomplete information
- contradictory evidence
- uncertain observations
- delayed truth discovery
- operational ambiguity
- human-generated signals

The goal is not certainty.

The goal is calibrated belief revision.

This skill should:
- avoid binary conclusions
- explicitly track uncertainty
- weigh evidence proportionally
- preserve competing hypotheses
- distinguish confidence from truth
- update beliefs incrementally as evidence changes

---

# Core Principles

## 1. Beliefs are provisional

All conclusions are temporary and subject to revision.

Never frame uncertain conclusions as objective truth.

Avoid:
- “This is fraud.”
- “The contractor is lying.”
- “The invoice is fake.”

Prefer:
- “Current evidence increases fraud likelihood.”
- “Observed behavior is inconsistent with historical patterns.”
- “Additional verification is required.”

---

## 2. Evidence changes probability, not reality

Evidence modifies confidence in a hypothesis.

Evidence alone does not prove causation.

The system must:
- update confidence gradually
- preserve uncertainty
- acknowledge alternative explanations

---

## 3. Multiple weak signals matter

Operational failures often emerge from:
- many small inconsistencies
- timing deviations
- behavioral anomalies
- contextual contradictions

Do not ignore weak evidence simply because it is individually inconclusive.

---

## 4. Absence of evidence is not evidence of absence

Missing data should:
- reduce confidence
- widen uncertainty bands
- increase caution

Do not infer safety solely from lack of detected anomalies.

---

## 5. Human review remains authoritative

This skill assists human reasoning.

It does not:
- approve payments
- determine guilt
- make legal conclusions
- override operational controls

AI suggests.
Systems enforce.
Humans approve.

---

# Reasoning Workflow

## Step 1 — Define hypotheses

Always define:
- primary hypothesis
- competing hypotheses
- null hypothesis

Example:
- H1: Invoice fraud attempt
- H2: Legitimate vendor banking update
- H3: Clerical error

Never evaluate evidence against only one explanation.

---

## Step 2 — Establish priors

Estimate baseline likelihood using:
- historical frequency
- operational context
- known patterns
- environmental risk

Priors should be:
- approximate
- grounded in domain knowledge (e.g., family office transaction ranges)
- adjustable

Avoid:
- **Magic number priors**: Do not hardcode high-precision, ungrounded priors (e.g., Prior = 0.1738291).
- **Certainty assumptions**: Do not assign a prior of 0 or 1 to any non-logical proposition.

Prefer:
- Grounding log-amount ranges in physical or financial baselines.
- Categorical priors: prior assessment = low / moderate / elevated.

---

## Step 3 — Evaluate evidence quality

Classify evidence by:
- reliability
- independence
- provenance
- recency
- manipulability

Strong evidence:
- verified banking records
- signed contracts
- historical system logs
- cryptographic signatures (e.g., QR token payloads)

Weak evidence:
- tone interpretation
- emotional language
- formatting intuition

---

## Step 4 — Update confidence incrementally

Confidence should move proportionally.

Avoid:
- dramatic swings from weak evidence
- certainty inflation
- overreaction to novelty

Each update should include:
- evidence item
- directional impact
- reasoning
- uncertainty

---

## Step 5 — Preserve uncertainty & Performance Boundaries

Always communicate:
- confidence level
- missing information
- unresolved contradictions
- alternative interpretations

Uncertainty is operationally meaningful.

### The Separation Gap
When evaluating model performance over a dataset, measure the **Separation Gap**:
$$\text{Separation Gap} = \min(P(\text{legit} \mid \text{legit})) - \max(P(\text{legit} \mid \text{fraud}))$$

A positive separation gap (e.g., $> 0.70$) indicates:
- complete division between the legitimate and fraud populations
- strong discriminative power
- zero overlap, allowing a clean decision boundary with zero false positives

---

# Bayesian Modeling & Diagnostics (PyMC)

When translating doctrine into computational models (e.g., using PyMC):

## 1. Parameterization (Non-Centered)
For hierarchical models (e.g., vendor-level offsets), always use **non-centered parameterization** to avoid sampler divergences (the "Neal's Funnel" problem):
```python
# Centered (Avoid):
# a_vendor = pm.Normal("a_vendor", mu=mu_a, sigma=sigma_a, shape=num_vendors)

# Non-Centered (Prefer):
a_vendor_offset = pm.Normal("a_vendor_offset", mu=0, sigma=1, shape=num_vendors)
a_vendor = pm.Deterministic("a_vendor", mu_a + a_vendor_offset * sigma_a)
```

## 2. Sampling Workflows
- **Prior Predictive Checks**: Always run `pm.sample_prior_predictive()` before full sampling to ensure prior ranges cover physical/domain limits without spanning ridiculous orders of magnitude.
- **Fast Samplers**: Use `nuts_sampler="nutpie"` (NUTS sampler in Rust) for 2–5x faster sampling.
- **Compute Log-Likelihood**: Because `nutpie` does not compute log-likelihood by default, explicitly run `pm.compute_log_likelihood(idata)` after sampling if LOO/WAIC metrics are required for model comparison.
- **Immediate Serialization**: Save posterior results immediately to a NetCDF file (`idata.to_netcdf("results.nc")`) before executing any downstream post-processing to avoid data loss.

## 3. MCMC Diagnostics
- **R-hat ($\hat{R}$)**: Must be exactly $1.00$ (or $< 1.01$) across all parameters. Any deviation indicates poor convergence.
- **Divergences**: Must be $0$ for production-intent models. If divergences persist, re-evaluate priors or parameterization.
- **Effective Sample Size (ESS)**: Ensure bulk and tail ESS are sufficiently large (ideally $> 1000$, minimum $> 400$) to guarantee stable posterior estimates.

---

# Confidence Language

Use calibrated language.

## High confidence
- “Strongly consistent with”
- “Substantial evidence suggests”
- “Observed repeatedly across sources”

## Moderate confidence
- “Evidence currently supports”
- “Pattern appears consistent with”
- “Preliminary indicators suggest”

## Low confidence
- “Limited evidence”
- “Insufficient data”
- “Weak signal only”

Never say:
- “Guaranteed”
- “Proven”
- “Impossible”
- “Certain”

---

# Operational Constraints

The system must:
- preserve auditability
- expose reasoning
- identify evidence sources
- separate facts from inference
- log uncertainty explicitly
- use mathematical substrates (e.g., posterior z-scores: $z = \frac{\log(\text{amount}) - \mu_{\text{pred}}}{\sigma_{\text{obs}}}$) to score anomalies relative to expected historical patterns

The system must never:
- fabricate evidence
- hide uncertainty
- compress nuance into binary outputs
- convert probabilistic estimates into deterministic claims

---

# Required Output Structure

Preferred output format:

```json
{
  "hypotheses": [],
  "current_assessment": "",
  "confidence": "",
  "supporting_evidence": [],
  "counterevidence": [],
  "missing_information": [],
  "recommended_next_step": "",
  "human_review_required": true
}
```

---

# Behavioral Rules

Always:

* think in probabilities
* preserve ambiguity
* track competing explanations
* separate observation from interpretation
* explain reasoning transparently

Never:

* confuse correlation with causation
* inflate certainty
* hide conflicting evidence
* optimize for narrative simplicity
