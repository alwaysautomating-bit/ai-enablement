---
name: operational-intelligence
description: Framework for extracting signal from operational noise — turning raw events, patterns, and anomalies into interpretable intelligence that drives better decisions. Use when designing detection logic, anomaly interpretation, feedback loops, pattern recognition, or any system that needs to learn from operational data over time. Covers signal vs. noise classification, event correlation, probabilistic reasoning, consequence mapping, and the difference between data and intelligence. Trigger on detection systems, fraud pattern recognition, operational analytics, risk modeling, or any "what does this data tell us" task.
---

# Operational Intelligence Skill

Data is what happened. Intelligence is what it means.

An organization produces signals constantly — payment patterns, vendor behavior, operator hesitations, exception rates, timing anomalies. Most systems collect these events. Almost none interpret them. The gap between collection and interpretation is where fraud hides, where inefficiency compounds, and where institutional knowledge evaporates.

**Operational intelligence is the practice of turning observable operational signals into decisions.**

---

## Signal vs. Noise

The first problem in any operational environment is that noise vastly outnumbers signal. Most anomalies are not fraud. Most exceptions are not patterns. Most outliers are not risks.

The goal is not to flag everything. It is to surface the things that matter.

### Signal Classification

| Category | Description | Response |
|---|---|---|
| **True signal** | Anomaly that reflects a real condition requiring attention | Investigate, act |
| **False positive** | Anomaly triggered by rule but not reflecting real risk | Note, calibrate rule |
| **Noise** | Normal variation within expected range | Ignore, do not surface |
| **Weak signal** | Single data point that may become significant in context | Log, monitor for pattern |
| **Pattern signal** | Multiple weak signals that together constitute a finding | Escalate, investigate |

**A single anomaly is a question. A pattern of anomalies is a finding.**

---

## Event Correlation Logic

Individual events rarely tell the story. The story is in the relationships between events.

### Correlation Dimensions
- **Temporal**: Events that cluster in time (multiple exceptions in the same period)
- **Entity**: Events that cluster around a single vendor, operator, or account
- **Structural**: Events that share a method or format (same invoice structure, same email domain pattern)
- **Threshold**: Events that consistently land just below approval thresholds
- **Sequence**: Events that follow a specific order associated with known fraud patterns

### Correlation Red Flags
- Vendor with multiple hold events that all resolved the same way
- Operator who consistently approves exceptions without documented rationale
- Invoice amounts that repeatedly cluster at 95-99% of approval thresholds
- Banking changes followed by payment requests within a narrow time window
- Exception rates that spike around personnel changes or audit periods

---

## Anomaly Interpretation Framework

When an anomaly is detected, the question is not "is this wrong?" The question is "what does this tell us?"

### Interpretation Steps

1. **Isolate the anomaly**: What specifically is different from expected?
2. **Check for context**: Is there a known explanation? (seasonal variation, new vendor, policy change)
3. **Check for pattern**: Has this happened before? With the same entity? In the same conditions?
4. **Classify intent**: Is this likely accidental, systemic, or intentional?
5. **Assess consequence**: If this anomaly reflects a real problem, what is the potential impact?
6. **Determine action**: Investigate, log and monitor, escalate, or dismiss?

### Intent Classification
- **Accidental**: One-time, no pattern, plausible innocent explanation
- **Systemic**: Recurring, likely due to process gap or unclear policy
- **Intentional**: Pattern, escalating, resistant to normal correction

Accidental anomalies are process issues. Systemic anomalies are design issues. Intentional anomalies are security issues. Each requires a different response.

---

## Feedback Loops

A system that doesn't learn from its own signals is collecting data, not building intelligence.

### Feedback Loop Design
Every detection rule should have:
- **Trigger rate**: How often does this rule fire?
- **True positive rate**: Of fires, how many were real findings?
- **False positive rate**: Of fires, how many were noise?
- **Outcome data**: When a finding was acted on, what happened?

Rules with high false positive rates generate alert fatigue and eventually train operators to ignore them. Rules with low trigger rates may be calibrated too conservatively.

### Calibration Triggers
Recalibrate a detection rule when:
- False positive rate exceeds 40%
- The same entity is triggering the same rule repeatedly with no real finding
- Operators are consistently dismissing the same alert type
- A fraud event occurred that the rule should have caught but didn't

### The Hesitation Data Loop
Operator hesitation data (from the Defensible Pause skill) is an underutilized intelligence source. Patterns in where operators hesitate — before which vendor types, which invoice patterns, which request structures — reveal risk concentrations that rule-based systems don't detect.

**Operators have better intuition than rules. Build systems that capture and learn from that intuition.**

---

## Probabilistic Reasoning Standards

Not every risk is binary. Operational intelligence requires working with probability, not just yes/no.

### Risk Scoring Principles
- Scores should reflect the probability that something is wrong, not just whether a rule fired
- Multiple weak signals should compound (not just add)
- Context should modify probability (a banking change from a 10-year vendor is different from one from a 3-month vendor)
- Thresholds should be explicit and documented (why is 75 the hold threshold, not 70 or 80?)

### What a Risk Score Is
A risk score is a compressed representation of multiple signals, each weighted by their predictive value. It is:
- A routing mechanism, not a verdict
- Input to human judgment, not a replacement for it
- A snapshot at a point in time, not a permanent label

### What a Risk Score Is Not
- Evidence of wrongdoing
- Grounds for refusing service without investigation
- A substitute for the verification steps that produced the underlying signals

**A high risk score means "look here." It does not mean "this is fraud."**

---

## Consequence Mapping

Every signal exists in a consequence context. The same anomaly has different implications depending on the stakes.

| Anomaly | Low Stakes Context | High Stakes Context |
|---|---|---|
| Duplicate invoice | Minor clerical error | Potential overbilling, investigate |
| Banking detail change | Routine update | Potential BEC, hold and verify |
| Operator hesitation | Normal uncertainty | Fraud signal cluster if recurring |
| Late invoice submission | Process gap | Retroactive documentation concern |

Map anomalies to consequences before designing detection rules. The goal is proportional response, not maximum sensitivity.

---

## Beyond Normal SaaS: Operational Intelligence as Product

Most software tracks what happened. Operational intelligence tells you what it means and what to do next.

The progression:
1. **Data collection**: Events are logged
2. **Reporting**: Events are summarized and displayed
3. **Alerting**: Threshold events trigger notifications
4. **Detection**: Patterns in events are identified automatically
5. **Intelligence**: Patterns are interpreted and routed to action
6. **Learning**: Outcomes feed back into detection calibration

Most products stop at level 3. Levels 4-6 are where institutional judgment gets encoded into systems — and where the operational scar tissue becomes a competitive moat.

The question to ask when designing any operational system: *at which level does this product operate, and what would it take to move to the next level?*
