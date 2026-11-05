---
name: operational-delta-analysis
description: Technical framework for implementing Bayesian change-point and regime-shift detection to identify step changes in operational behaviors, vendor billing schedules, and role transitions.
---

# Operational Delta Analysis (Change-Point & Regime Shift)

## Purpose

This skill establishes the logical and mathematical standards for detecting structural shifts in operational transaction time-series. 

Standard statistical process controls rely on static moving averages or rolling standard deviations, which are slow to react and easily fooled by gradual drift. This skill implements **Bayesian Change-Point Detection** to identify the exact step index where a vendor's transaction frequency or billing amounts shifted regimes.

The goal is to identify unauthorized role transitions, billing structural changes, or billing fraud early in the lifecycle.

---

# Mathematical Change-Point Modeling (PyMC)

A change-point model assumes that a vendor's historical time-series of transactions is split into two distinct regimes separated by a latent switch parameter $\tau$ (the change-point step).

```
   Regime 1 (t < τ)                       Regime 2 (t ≥ τ)
   Rate = λ₁                              Rate = λ₂
   
   ▲                                      ▲
   │        o      o                      │               o   o  o
   │    o      o       o                  │    o   o  o     o
   │  o   o      o   o                    │  o   o   o  o
   └─────────────────────────[ τ ]────────┴────────────────────────► Time
```

## 1. Modeling Transaction Frequency (Poisson Change-Point)
To detect shifts in billing frequency (e.g., a vendor suddenly billing weekly instead of monthly), model the transaction counts $y_t$ per time window $t \in \{1, \dots, T\}$:

$$y_t \sim \text{Poisson}(\lambda_t)$$
$$\lambda_t = \begin{cases} \lambda_1 & \text{if } t < \tau \\ \lambda_2 & \text{if } t \ge \tau \end{cases}$$

### Priors
- **Change-point $\tau$**: Distributed uniformly over the observed steps:
  $$\tau \sim \text{DiscreteUniform}(1, T)$$
- **Regime rates $\lambda_1, \lambda_2$**: Grounded in historical baselines using exponential or gamma distributions:
  $$\lambda_1 \sim \text{Exponential}(\alpha_{\text{baseline}})$$
  $$\lambda_2 \sim \text{Exponential}(\alpha_{\text{baseline}})$$

---

## 2. Modeling Transaction Amounts (Lognormal Change-Point)
To detect structural step changes in payment sizes (e.g., shifting from small double-digit maintenance charges to high triple-digit capital expenses), model invoice amounts $a_t$:

$$a_t \sim \text{Lognormal}(\mu_t, \sigma_{\text{obs}})$$
$$\mu_t = \begin{cases} \mu_1 & \text{if } t < \tau \\ \mu_2 & \text{if } t \ge \tau \end{cases}$$

### Priors
- **Regime means $\mu_1, \mu_2$**: Normal distributions grounded in historical baseline logs:
  $$\mu_1, \mu_2 \sim \text{Normal}(\mu_{\text{log\_baseline}}, \sigma_{\text{log\_baseline}})$$

---

# PyMC Implementation Guidance

Because $\tau$ is a discrete parameter, traditional Hamiltonian Monte Carlo (HMC/NUTS) samplers in PyMC cannot directly compute gradients for it. 

## Implementation Options
1. **Discrete Sampling**: Use PyMC's compound step sampler, which automatically assigns a `Categorical` or `Metropolis` sampler to the discrete $\tau$ node and NUTS to continuous parameters ($\lambda_1, \lambda_2$).
2. **Marginalized/Continuous Sigmoid Approximation**: For large datasets, approximate the step transition using a continuous sigmoid function to enable full NUTS/nutpie sampling:
   $$\mu_t = \mu_1 + (\mu_2 - \mu_1) \cdot \text{sigmoid}\left(\frac{t - \tau}{s}\right)$$
   Where $s$ controls the sharpness of the transition regime.

---

# Operational Triggers & Action Pathways

A regime shift is mathematically confirmed when the posterior distribution of $\tau$ concentrates and the rate change is significant:

$$P(\lambda_2 \ne \lambda_1 \mid y_{1:T}) > 0.95$$

## Action Pathways on Confirmation
*   **Role Change Verification**: If transaction frequency ($\lambda$) shifts from twice-monthly to multi-weekly, flag the account with a `ROLE_CHANGE_DETECTED` alert and lock further payments.
*   **Spend Leakage Alert**: If billing sizes ($\mu$) experience a step-up shift ($\mu_2 > \mu_1$), flag the vendor record as `REGIME_SHIFT_DETECTED`. Mandate a manual contract review to verify if a new project authorization was signed.

---

# Required Output Structure

```json
{
  "change_point_analysis": {
    "regime_shift_detected": false,
    "posterior_change_step": {
      "mean_tau": 0.0,
      "hdi_95_tau": [0.0, 0.0]
    },
    "regime_parameters": {
      "regime_1_mean": 0.0,
      "regime_2_mean": 0.0,
      "relative_rate_increase_percent": 0.0
    },
    "shift_probability": 0.0,
    "action_triggered": "NONE | ISSUE_ALERT | HOLD_PAYMENTS"
  }
}
```
