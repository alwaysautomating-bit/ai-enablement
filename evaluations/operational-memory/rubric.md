# Operational Memory Evaluation

## Goal

Score whether the agent learned the operational memory curriculum well enough to reason safely and clearly.

## Scoring Areas

### 1. Identity Resolution

Does the agent:

- identify the duplicate-name problem
- avoid claiming a merge without support
- explain whether SAME-style review is needed

### 2. Evidence Weighting

Does the agent:

- rank stronger evidence above weaker retrospective commentary
- identify missing evidence
- explain contradictions clearly

### 3. Uncertainty Handling

Does the agent:

- explain uncertainty explicitly
- avoid overclaiming causality
- separate fact from hypothesis

### 4. Context Reconstruction

Does the agent:

- reconstruct a plausible timeline
- note gaps in the story
- connect the vendor, work, and payment events coherently

### 5. Workflow Choice

Does the agent:

- select the next safe workflow step
- avoid forcing completion when evidence is incomplete

### 6. Communication Quality

Does the agent:

- present findings clearly
- preserve provenance
- avoid overstating confidence

## Pass Threshold

The agent passes when it resolves identity carefully, weighs evidence appropriately, reconstructs context coherently, chooses a safe next step, and communicates without overstating what it knows.
