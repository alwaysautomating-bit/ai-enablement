---
name: assess-change-rigidity
description: Classify a proposed change as invariant, controlled, or adaptive from its consequences, reversibility, dependency depth, semantic load, evidence, and safety exposure. Use before changing architecture, schemas, policies, interfaces, governance rules, or other potentially load-bearing system elements.
---

# Assess Change Rigidity

1. Resolve the exact subject and proposed change.
2. Identify safety, integrity, provenance, identity, audit, policy, and contractual consequences.
3. Map affected consumers and dependency depth.
4. Assess reversibility, migration cost, and semantic load.
5. Evaluate the evidence supporting the current boundary.
6. Classify the subject as `invariant`, `controlled`, or `adaptive`.
7. State confidence, reasons, unknowns, and required change controls.

Never infer rigidity from age, documentation status, prior approval, familiarity, or implementation effort.

Required output: classification, confidence, consequence evidence, reversibility, dependencies, unknowns, and change requirements.
