---
name: scope-containment
description: Doctrine for deciding what not to build — identifying scope creep, enforcing product boundaries, and making deliberate exclusions that protect a product's coherence, compliance posture, and long-term defensibility. Use when evaluating feature requests, planning builds, or deciding whether a capability belongs in a product. Covers scope creep patterns, exclusion rationale, compliance-driven boundaries, and how to communicate what a product intentionally does not do. Trigger on product scoping, feature evaluation, architecture decisions, or any "should we build this?" question.
---

# Scope Containment Skill

The most important product decisions are often what to leave out.

Every feature added to a product:
- Increases surface area for bugs and exploits
- Adds cognitive load for operators
- May trigger regulatory requirements that didn't previously apply
- Creates maintenance burden
- Dilutes what the product is actually for

**Scope containment is not limitation. It is architecture.** The difference between a focused tool and bloatware is not capability — it is discipline about what belongs.

---

## The Exclusion Test

Before adding any capability to a product, it must pass the exclusion test:

1. **Does this capability belong to this product's core job?**
   If the product's job is enforcement, a feature that shifts it toward execution is out of scope.

2. **Does adding this capability change the regulatory posture?**
   Adding payment execution to a payment verification product may trigger PCI scope. Adding healthcare data handling triggers HIPAA. Compliance boundaries are real product boundaries.

3. **Does this capability require a different trust model?**
   Some features require you to be trusted differently — as a fiduciary, as a payment processor, as a data custodian. If the new capability requires a different kind of trust than the product currently earns, it probably belongs in a separate product.

4. **Does adding this dilute the core value proposition?**
   If the product's value is "it enforces," a feature that lets users bypass enforcement "just this once" destroys the core value regardless of how popular the request is.

5. **Would excluding this be defensible to a customer?**
   A well-reasoned exclusion is a feature, not a bug. "We don't do X because X would compromise Y" is a trustworthy answer.

---

## Compliance-Driven Boundaries

Some exclusions are not preferences — they are the correct architecture for a regulated environment.

### PCI Scope Avoidance
- Storing, processing, or transmitting cardholder data triggers PCI DSS compliance requirements
- A system that handles payment *verification* but not payment *execution* can stay out of PCI scope
- Once you handle actual card data or initiate payment, PCI scope applies
- **Doctrine**: If the product's value is in the verification layer, payment execution belongs downstream, not inside the product

### SOC 2 Boundary Design
- Trust Service Criteria apply to systems that handle customer data in ways that affect availability, confidentiality, or integrity
- Keeping third-party data handling to a minimum reduces audit surface area
- Design products so that sensitive data stays in the customer's environment when possible

### Regulatory Trigger Awareness
Before adding any feature, ask: does this trigger a new regulatory category?
- Payment initiation → money transmitter license in some jurisdictions
- Healthcare data → HIPAA
- Biometric data → state biometric privacy laws
- Financial advice → securities regulations
- Custodianship of funds → banking regulations

These are not edge cases. They are boundaries that define product architecture.

---

## Scope Creep Patterns

### "Just One More Field"
A form gains one more field, then another, then the interface no longer represents the core use case. Each field seemed reasonable in isolation.

**Detection**: When you can't describe the form's job in one sentence anymore.

### "Important Vendor Request"
A high-value customer asks for a feature that doesn't belong in the product. The feature gets added to preserve the relationship.

**Response**: The feature should go on a separate roadmap, in a separate product, or not at all. A customer relationship does not override product coherence.

### "We're Already Touching That Data"
A capability gets added because the system already has access to the relevant data. Access is not justification.

**Detection**: "We could" being used as a reason to build something, rather than "this is what the product is for."

### "Edge Case Accommodation"
The core flow handles 95% of cases. A series of edge case accommodations gradually expands the product into territory it wasn't designed for.

**Detection**: When edge case handling has more code than the core flow.

### "Progressive Expansion"
The product starts focused. Success leads to expansion. Expansion leads to complexity. Complexity leads to the product doing many things poorly instead of one thing well.

**Detection**: When the product's pitch requires a list of features rather than one sentence.

---

## How to Communicate Deliberate Exclusions

A well-communicated exclusion builds trust. It signals that the product's boundaries are thoughtful, not arbitrary.

### Exclusion Communication Framework
1. **State what the product does not do** (clearly, without apologizing)
2. **State why** (compliance, coherence, or trust model — be specific)
3. **State what the correct tool for that need is** (if one exists)

**Example:**
*"SYNCD AP does not initiate payments. This is intentional — it keeps the product out of PCI scope and out of the payment execution chain, which means your AP team's verification decisions are never bypassed by the software. Payment execution happens in your existing banking system, downstream from SYNCD AP's approval."*

This is not a limitation. It is the product's compliance architecture explained as a benefit.

---

## Scope Containment in Practice: SYNCD AP

SYNCD AP's deliberate exclusions and their rationale:

| Excluded Capability | Reason |
|---|---|
| Payment execution | Keeps product out of PCI scope; preserves enforcement-only posture |
| Automatic approval | Core doctrine: a system that can approve automatically can be tricked into approving automatically |
| Decryption failure pass-through | Decryption failure = HOLD, always; no silent failure |
| Contact information from invoice | Verification must come from vendor record, never from submitted document |

Each of these exclusions *is* the product's value. Removing any of them would not make the product more capable — it would make it less trustworthy.

---

## The Vesta Classification Check

Before shipping any feature or product, classify it:

- **GARDRAILS product**: Enforcement-first, compliance-architecture, fraud prevention
- **Viform product**: Design philosophy, system thinking, human-centered
- **Vesta experiment**: Internal build, prototype, not yet classified

If a feature doesn't fit the classification of its product, it belongs somewhere else or nowhere.
