---
name: simplify-recent-code
description: Refine recently modified or explicitly selected code for clarity while preserving observable behavior and exact scope.
---

# Simplify Recent Code

Operate in one explicitly resolved mode:

- `review`: identify opportunities without editing
- `propose`: prepare an unapplied change
- `apply`: edit and run relevant verification

## Method

1. Resolve the exact target from a recent diff or explicit selection.
2. Discover repository and directory-specific instructions dynamically.
3. State the observable invariants: public interfaces, outputs, side effects, errors, ordering, data shapes, accessibility behavior, and relevant performance.
4. Prefer explicit clarity over line-count reduction. Preserve intentional abstractions and domain language.
5. Avoid unrelated cleanup.
6. Inspect the resulting or proposed diff.
7. Run narrow, relevant verification and disclose every gap.
8. Leave code unchanged when no material improvement is available.

## Required output

- resolved mode and scope
- observations or bounded change
- preserved-invariants statement
- verification results and gaps
- explicit no-change result when appropriate

## Boundary

Review never edits. Propose never applies. Apply requires edit authority. Broader redesign and interface changes require separate authorization.
