# SAME Research Readiness Evaluation

## Goal

Check whether the agent set and workflow are ready to run SAME research responsibly.

## Criteria

### 1. Boundary Discipline

- Production scoring remains deterministic.
- SAME stays offline.

### 2. Dataset Discipline

- Export contains required fields.
- Labels are sufficiently present.
- Approved and rejected examples both exist.

### 3. Hard Case Quality

- Ambiguous positives exist.
- Ambiguous negatives exist.
- Human review rationale is captured.

### 4. Feature Analysis Quality

- False positives are identified.
- False negatives are identified.
- Signal combinations are interpreted clearly.

### 5. Deterministic Tuning Discipline

- Weight changes are evidence-backed.
- Proposed changes are documented before adoption.

### 6. Modeling Discipline

- Model work starts only after data and deterministic baselines are understood.
- Experimental output is compared directly against human labels and deterministic scoring.

### 7. Human Governance

- Human review points are explicit.
- No irreversible decisions are delegated away.

## Pass Threshold

The workflow is ready when agents can do most analytical work, the human governs the trust-critical decisions, and the system can clearly say whether modeling is justified.
