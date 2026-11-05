# Ontology

Status: FORMING

## Canonical Terms

- **Workspace**: A bounded product surface whose capabilities and guardrails are fixed by its tier.
- **Framework**: A versioned, approved contract for producing one recognizable work outcome.
- **Run**: One governed execution of a framework from input through terminal disposition.
- **Revision**: An immutable version of a run's deliverable.
- **Review Item**: A revision-specific condition requiring explicit human acknowledgement.
- **Approval**: A human decision bound to one exact revision; material change invalidates it.
- **Connector**: A permissioned link to an external source or system. L0 connectors are read-only.
- **Context Capture**: A bounded investigation that proposes evidence-backed operational context for review.
- **Reviewed Context**: Candidate context that a person has explicitly confirmed for governed reuse.
- **Production Deployment**: The Vercel target designation. It does not by itself mean the data layer is production-ready.
- **Evaluation Build**: The current hosted application, protected by Vercel and backed by ephemeral runtime storage.

## Boundaries

- Generated output remains a draft until approval.
- Preview runtime persistence is not durable organizational memory.
- External pilot data is prohibited until the managed Postgres deployment gate is satisfied.
