# AI Enablement Workspace Build Rules

## Product Boundaries

- Build recognizable jobs, not a general chat box.
- Keep L0 connections read-only.
- Keep connector education optional and permission review mandatory.
- Treat generated output as a draft until explicit human approval.
- Invalidate approval after any material edit.
- Preserve source and decision provenance.
- Do not introduce L1 write access or L2 automation through an L0 shortcut.

## Communication

- Follow `docs/VOCABULARY_EARNED_DOCTRINE.md`.
- Describe the job before discussing implementation.
- Do not force system vocabulary before the user has expressed the concept.
- Keep precise vocabulary available on demand.
- Require one first priority when "all of it" would erase MVP scope.

## Privacy

- Use the minimum necessary data.
- Never store reversible identity mappings in the main application database.
- Privacy Scrubber mappings belong in separate encrypted infrastructure and use hard delete.
- Do not claim that masking automatically creates compliance or anonymity.

## Engineering

- Keep the repository context-clean and product-specific.
- Prefer small, testable vertical slices.
- Use server-side authorization for every protected capability.
- Keep immutable audit evidence free of raw secrets and vault mappings.
- Never use `prisma db push` in production; use reviewed migrations.
- Update the managed project files at substantive session closeout.
