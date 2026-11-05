---
name: synthetic-packet-review
description: Computational framework for executing Latent Dirichlet Allocation (LDA) topic modeling and geo-spatial coordinate analysis on structured document extractions to identify coordinated scope overlap, duplication, and invoice fragmentation.
---

# Synthetic Packet Review (Scope Overlap & Duplicate Detection)

## Purpose

This skill establishes the computational and analytical standards for detecting coordinated, multi-document billing fraud across vendors and projects. 

Threat actors and malicious subcontractors exploit silos by submitting duplicate claims across different project managers, or by fragmenting a single large unauthorized expense into multiple small invoices that slip under individual approval limits. This skill implements **Latent Dirichlet Allocation (LDA) Topic Modeling** combined with **Geo-Spatial Coordinate mapping** to identify latent overlaps and coordinate-level billing anomalies.

The goal is to maintain absolute scope containment and protect against duplicate payment leakage.

---

# Latent Dirichlet Allocation (LDA) for Scope Extraction

To identify duplicate scopes of work without relying on exact text matches (which subcontractors defeat by rewriting descriptions), we extract the latent semantic "topics" of the invoice packet using LDA.

## Mathematical Formulation
The structured document text extracted via LlamaParse is normalized into a bag-of-words representation for document $d \in \{1, \dots, D\}$:

1. **Document Topic Distribution ($\theta_d$)**: For each document, sample a multinomial topic distribution from a Dirichlet prior:
   $$\theta_d \sim \text{Dirichlet}(\alpha)$$
2. **Topic Word Distribution ($\phi_k$)**: For each of the $K$ latent topics (e.g., painting, landscaping, masonry), sample a word distribution:
   $$\phi_k \sim \text{Dirichlet}(\beta)$$
3. **Word Topic Assignment ($z_{dn}$)**: For each word $n$ in document $d$, sample a latent topic $z_{dn} \sim \text{Multinomial}(\theta_d)$ and then sample the observed word $w_{dn} \sim \text{Multinomial}(\phi_{z_{dn}})$.

This infers a vector $\theta_d$ representing the exact percentage breakdown of active scopes (topics) in that invoice (e.g., $\theta_d = [\text{painting: } 0.85, \text{landscaping: } 0.15, \text{drywall: } 0.00]$).

---

# Coordinated Scope Overlap Detection

Once topic vectors $\theta_d$ are inferred, we combine them with geo-spatial and temporal metadata from SyncCapture logs to calculate a **Coordinated Scope Overlap Index ($I_{\text{overlap}}$)** between any two concurrent invoices $d_1$ and $d_2$:

$$I_{\text{overlap}} = \text{CosineSimilarity}(\theta_{d_1}, \theta_{d_2}) \cdot \exp\left(-\frac{\Delta \text{dist}^2}{2\sigma_{\text{dist}}^2}\right) \cdot \exp\left(-\frac{\Delta t^2}{2\sigma_t^2}\right)$$

Where:
- $\text{CosineSimilarity}(\theta_{d_1}, \theta_{d_2})$ measures the similarity of the billed scopes of work.
- $\Delta \text{dist}$ is the geographical distance (meters) between the GPS coordinates logged by SyncCapture at intake.
- $\Delta t$ is the difference in submission timestamps (days).
- $\sigma_{\text{dist}}, \sigma_t$ are scaling bandwidths (e.g., $\sigma_{\text{dist}} = 50\text{m}$, $\sigma_t = 30\text{ days}$).

An index $I_{\text{overlap}} > 0.75$ between different vendors on the same project flags an immediate **Double-Billing Alert** for manual operator review.

---

# Detecting Multi-Invoice Fragmentation

Subcontractors often attempt to bypass executive authorization thresholds (e.g., any transaction $> \$5,000$ requires VP sign-off) by fragmenting a single large job into $N$ smaller invoices (e.g., 5 invoices for $\$4,500$ each).

## Detection Logic
1. **Topic Alignment**: Group active invoices from the same vendor that share the same dominant LDA topic ($\theta_{d, k} > 0.70$).
2. **Temporal Clustering**: Measure the average time gap between submissions. High-frequency submissions (e.g., multiple invoices within 7 days) indicate temporal clustering.
3. **Threshold Proximity**: Calculate if individual amounts are just below standard approval caps.
4. **Cumulative Risk**: If the cumulative amount exceeds the approval threshold, flag as `INVOICE_FRAGMENTATION_SUSPECTED`. Force the system to block automated routing and escalate the entire combined packet to the higher-level authority loop.

---

# Required Output Structure

```json
{
  "scope_overlap_analysis": {
    "topic_distribution": {
      "document_id": "",
      "dominant_topic_id": 0,
      "topic_proportions": []
    },
    "overlap_check": {
      "overlap_detected": false,
      "overlapping_document_id": "",
      "overlap_index": 0.0,
      "gps_distance_meters": 0.0
    },
    "fragmentation_check": {
      "fragmentation_detected": false,
      "invoice_cluster_count": 0,
      "cumulative_amount": 0.0,
      "target_authorization_threshold_exceeded": false
    },
    "action_required": "PASS | ESCALATE_COORDINATED_REVIEW | HOLD_VENDOR"
  }
}
```
