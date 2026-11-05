---
name: evidence-weighting
description: Operational framework for evaluating evidence reliability, metadata-provenance hierarchy, and resolving contradictory signal weights.
---

# Evidence Weighting (Provenance & Metadata Hierarchy)

## Purpose

This skill establishes the standards for evaluating the quality, authenticity, and weight of incoming operational evidence. 

In automated finance and construction operations, textual claims (e.g., invoice line items, email requests, or manual progress claims) are easily falsified. This skill enforces a **strict evidence hierarchy** that weighs cryptographically signed tokens, system logs, and transmission metadata above human-written narrative content.

The goal is to maintain absolute processing integrity and prevent authorization creep.

---

# Core Boundary: Wide Capture, Narrow Authority

Evidence collection must be structured to maximize capture surface while protecting final payment and contracting decision boundaries:

```
[ Wide Capture (Low Friction) ]
  - Anyone on site scans QR token
  - Submits delivery photos, voice notes
  - No credentials, no data reading
  - Signed, single-purpose expiring tokens
         │
         ▼
[ Automated Verification Layer ]
  - Content hashes, GPS verification
  - Domain pipeline, email metadata check
         │
         ▼
[ Narrow Authority (High Security) ]
  - Authenticated finance operators only
  - Human reviews evidence & maps to draw
  - Immutably logs control events
  - Releases payment
```

1. **Wide Capture (Submit-Only)**: Field personnel and external contractors submit evidence via unauthenticated pathways (like single-purpose, signed QR tokens). They cannot read project data, browse history, or see financial records.
2. **Narrow Authority (Governed Actions)**: No field submission can ever trigger automated approvals, payments, or contract changes. Financial outcomes are strictly governed by authenticated, role-authorized human operators.
3. **The Audit Gap**: Every financial consequence requires a verified mapping between wide-capture evidence and authenticated authority decisions, logged immutably (append-only, no updates/deletes).

---

# The Information Provenance Hierarchy

When evaluating conflicting evidence, systems must weigh data sources based on their resistance to manipulation:

```
▲ [ LEVEL 1: CRYPTOGRAPHIC & SYSTEM LOGS ] (Highest Weight)
│  - Cryptographically signed tokens (e.g., valid QR payload token)
│  - SHA-256 document content hashes computed on intake
│  - Verified database system audit records (append-only ledger logs)
│
├─► [ LEVEL 2: METADATA & TRANSMISSION ] (Strong Weight)
│  - Email server auth flags (DMARC=PASS, DKIM=PASS, SPF=PASS)
│  - GPS coordinates with accuracy limits (lat/lng accuracy < 10m)
│  - Network server-side timestamp alignment (server-to-client delta < 5s)
│  - Operator hesitation logs (Pause Capture active tracking)
│
├─► [ LEVEL 3: STRUCTURAL & TEXT EXTRACTION ] (Moderate Weight)
│  - LlamaParse structured layout extractions (forms, tables, drawings)
│  - History baselines (prior routing frequency, vendor tenure)
│
▼ [ LEVEL 4: HUMAN CLAIMS & NARRATIVES ] (Lowest Weight - Manipulable)
   - PDF text assertions ("Painting complete")
   - Email thread claims ("Please pay immediately, we changed banks")
   - Screenshots of wire transactions or phone approvals
```

---

# Resolving Contradictory Signals

When signals conflict, apply the following **Conflict Resolution Rules**:

1. **Metadata Overrides Text**: If an invoice PDF text claims work was performed at site $A$, but the SyncCapture metadata GPS coordinates place the submission photo at site $B$ (50 miles away), the Level 2 metadata overrides the Level 4 text claim. Flag immediately as `CONTRADICTORY_SIGNAL` ($> 0.500$).
2. **Domain Overrides Narrative**: If an email thread claims to be from a trusted vendor's executive but the domain anomaly score is SUSPICIOUS (e.g., edit distance = 1 homoglyph), block standard routing and ignore all text-based urgency claims.
3. **Absence is a Signal**: If backing documentation is missing (Level 3/4 corroboration deficit $> 0.625$), do not assume safety because no active alarms are present. Widen the uncertainty bands and trigger a **Defensible Pause**.

---

# Required Output Structure

```json
{
  "evidence_evaluation": {
    "overall_provenance_tier": "Tier 1 | Tier 2 | Tier 3 | Tier 4",
    "provenance_validations": {
      "cryptographic_token_valid": false,
      "metadata_gps_verified": false,
      "email_auth_passed": false,
      "content_hash_collision_detected": false
    },
    "contradictions_found": [],
    "verdict": "TRUSTED | UNVERIFIED | COMPROMISED",
    "escalation_required": true
  }
}
```
