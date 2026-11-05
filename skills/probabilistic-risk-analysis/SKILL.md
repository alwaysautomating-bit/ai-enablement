---
name: probabilistic-risk-analysis
description: Foundational framework for executing multi-dimensional, time-dependent operational risk calculations, modeling cumulative spend velocity and communication urgency pressure.
---

# Probabilistic Risk Analysis (Velocity & Survival Models)

## Purpose

This skill provides a mathematically rigorous framework for modeling complex, time-dependent risk factors in operational systems. 

Traditional anomaly detection operates statically on single events. This skill incorporates **time-series state-space models** and **survival analysis** to track the evolution of operational behaviors over time, specifically addressing cumulative spending velocities and psychological pressure vectors.

The goal is to provide warning indicators for slow-rolling fraud (e.g., duplicate scopes, leakage) and temporal attack windows.

---

# 1. State-Space Dynamic Linear Models (DLMs) for Spend Velocity

To track a vendor's cumulative spend without relying on naive, static z-scores that fail to capture legitimate business growth, implement a State-Space DLM.

## State-Space Equations
The model represents the vendor's billing behavior through a latent state vector $\theta_t = [L_t, G_t]^T$, where $L_t$ is the current baseline spending level and $G_t$ is the growth rate (spend velocity):

$$\theta_t = G_t \theta_{t-1} + w_t \quad (\text{State Transition})$$
$$y_t = F_t \theta_t + v_t \quad (\text{Observation Equation})$$

Where:
- $y_t$ is the observed cumulative spend in window $t$.
- $G_t$ is the state transition matrix updating the level and velocity.
- $F_t$ is the observation vector mapping the latent state to observed spend.
- $w_t \sim \text{Normal}(0, W)$ is the state transition covariance (system noise).
- $v_t \sim \text{Normal}(0, V)$ is the observation variance (measurement noise).

## Anomaly Detection via Velocity
An anomaly is triggered when the posterior distribution of the growth rate parameter $G_t$ departs significantly from historical thresholds:

$$P(G_t > G_{\text{threshold}} \mid y_{1:t}) > 0.95$$

This identifies sudden, steep accelerations in billing volume that signal invoice fragmentation or unauthorized duplicate scopes, while ignoring smooth, seasonal, or project-aligned scale-ups.

---

# 2. Weibull Time-to-Event (Survival) Models for Urgency Pressure

Threat actors use artificial urgency and late-Friday submission timing to force analysts to bypass standard identity verification checks. This temporal behavior is modeled using survival analysis.

## The Hazard Function
The time-to-action (e.g., time between invoice submission and subsequent analyst interaction or escalation) is modeled as a survival time $T$ using a **Weibull Proportional Hazards model**:

$$h(t \mid x) = h_0(t) \exp(\beta^T x)$$

Where:
- $h_0(t) = \alpha \lambda t^{\alpha-1}$ is the baseline hazard function representing normal processing speed over time, parameterized by shape $\alpha$ and scale $\lambda$.
- $\beta$ is a vector of posterior coefficients representing the impact of specific urgency covariates.
- $x$ is the observed covariate vector:
  - $x_1$: `is_friday_afternoon` (1 if submitted after 14:00 on Friday, else 0)
  - $x_2$: `contains_escalation_cc` (1 if email CC list targets C-suite executives, else 0)
  - $x_3$: `origin_risk` (1 if submitted outside secure portal, else 0)

## Inferring Pressure
If the shape parameter $\alpha < 1$, the hazard rate decreases over time (indicating a high probability of immediate action pressure). A compressed timeline where the survival probability drops rapidly is flagged as a temporal pressure anomaly:

$$\text{Pressure Score} = 1 - S(t_{\text{observed}} \mid x)$$

Where $S(t)$ is the survival probability. A low survival probability at review indicates an unnaturally accelerated, high-pressure request that requires a mandatory **Defensible Pause**.

---

# Required Output Structure

```json
{
  "temporal_risk_analysis": {
    "spend_velocity": {
      "observed_spend_window": 0.0,
      "estimated_latent_level": 0.0,
      "estimated_growth_rate": 0.0,
      "growth_anomaly_probability": 0.0,
      "velocity_verdict": "STABLE | ACCELERATING | ANOMALOUS"
    },
    "urgency_pressure": {
      "time_delta_seconds": 0.0,
      "survival_probability": 0.0,
      "pressure_score": 0.0,
      "pressure_verdict": "NORMAL | ELEVATED | CRITICAL"
    },
    "action_verdict": "PASS | WATCH | REVIEW | HOLD"
  }
}
```
