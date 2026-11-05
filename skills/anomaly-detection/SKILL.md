---
name: anomaly-detection
description: Computational framework for executing multidimensional operational anomaly classification, email domain verification, and BEC camouflage protection.
---

# Anomaly Detection (8-Signal & Domain Verification)

## Purpose

This skill establishes the computational and logical standards for identifying anomalies inside transaction pipelines, invoice packets, and communication channels. 

Traditional rules-based security systems look for high dollar amounts or static blocklists, which threat actors easily bypass. This skill implements a **multidimensional anomaly detection framework** that uses probabilistic models and sequential domain analysis to flag subtle, coordinated deviations.

The goal is to detect threat vectors like Business Email Compromise (BEC) and billing manipulation before funds leave the ecosystem.

---

# The 8-Signal Anomaly Framework

Operational risk scoring must evaluate the **8-Signal Schema** to capture diverse threat indicators across identity, payment path, behavioral, and contextual classes:

| Signal Name | Class | Operational Description | Alarm Threshold |
|---|---|---|---|
| **`routing_days_risk`** | Identity | Measures the age of the routing number. New accounts are high-risk. | Routing active $< 45$ days ($>0.877$) |
| **`origin_risk`** | Identity | Evaluates the intake channel (e.g., direct email vs. secure client portal). | Outside portal ($>0.333$) |
| **`domain_anomaly_score`** | Identity | Quantitative spoofing score from the 10-step domain pipeline. | Any anomaly ($>0.000$) |
| **`vendor_tenure_risk`** | Payment Path | Measures the active length of the relationship. | Short tenure / first-time payments |
| **`instruction_change_freq`**| Payment Path | Frequency of routing/account number updates over time. | Rapid updates ($>0.199$) |
| **`corroboration_deficit`** | Behavioral | Measures backing documents (contracts, draws, inspection logs).| Fewer than 3 documents ($>0.625$) |
| **`contradictory_signal`** | Behavioral | Inconsistencies between invoice text, metadata, or prior history.| Conflicting records ($>0.500$) |
| **`amount_deviation`** | Contextual | Amount size relative to vendor's historical average. | Shift from baseline ($>1.5$ z-score) |

---

# The 10-Step Domain Anomaly Pipeline

Every incoming domain (e.g., from email threads or vendor registration) must run through the following 10 sequential checks to compute the `domain_anomaly_score`:

```
[ Input Domain ]
       │
       ▼
 1. Non-ASCII Check ─────────► BLOCKED (1.0)
       │ (No match)
       ▼
 2. Allowlist Match ─────────► CLEAN (0.0)
       │ (No match)
       ▼
 3. Cold Start Check ────────► UNKNOWN (0.3)
       │ (No match)
       ▼
 4. Homoglyph Detection ─────► SUSPICIOUS (0.95)
       │ (No match)
       ▼
 5. Edit Distance = 1 ───────► SUSPICIOUS (0.95)
       │ (No match)
       ▼
 6. Edit Distance = 2 ───────► SUSPICIOUS (0.70)
       │ (No match)
       ▼
 7. Unverified Subdomain ────► UNKNOWN (0.3)
       │ (No match)
       ▼
 8. TLD Manipulation ────────► SUSPICIOUS (0.70)
       │ (No match)
       ▼
 9. Canonical-as-Subdomain ──► SUSPICIOUS (0.70)
       │ (No match)
       ▼
10. Hyphen-Append ───────────► SUSPICIOUS (0.70)
       │ (No match)
       ▼
[ Default Fallback ] ────────► UNKNOWN (0.3)
```

### Explanations of Core Checks
- **Homoglyphs**: Character lookalikes (e.g., replacing Latin `o` with Cyrillic `о`, or `vvendor.com` instead of `vendor.com`).
- **Edit Distances**: Quantifies mutations (e.g., `bluedot-tech.com` vs `bluedottech.com`).
- **Canonical-as-Subdomain**: Placing a legitimate domain as a subdomain of a malicious site (e.g., `bluedot.com.attacker.com`).
- **Hyphen-Append**: Appending standard terms (e.g., `vendor-support.com` instead of `vendor.com`).

---

# Defending Against BEC Camouflage

> [!WARNING]
> **The BEC Camouflage Principle**
> Fraudulent invoice amounts often look **completely normal**. In Business Email Compromise (BEC) attacks, threat actors hijack active threads and submit invoices that copy expected dollar ranges perfectly (resulting in an `amount_deviation` posterior mean of ~$-0.02$).
> Naive systems looking for amount spikes are entirely blind to BEC. Risk engines must weigh identity, payment path, and behavioral signals (e.g., domain anomalies, routing number changes) as dominant predictors, while heavily discounting raw dollar amounts.

---

# Required Output Structure

```json
{
  "anomaly_assessment": {
    "overall_risk": "PASS | WATCH | REVIEW | HOLD",
    "signals_triggered": {
      "routing_days_risk": 0.0,
      "origin_risk": 0.0,
      "domain_anomaly_score": 0.0,
      "amount_deviation": 0.0
    },
    "domain_pipeline": {
      "domain_evaluated": "",
      "step_triggered": 0,
      "verdict": "CLEAN | UNKNOWN | SUSPICIOUS | BLOCKED",
      "score": 0.0
    },
    "bec_camouflage_detected": false
  }
}
```
