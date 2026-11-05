---
name: okf-knowledge-sidecar
description: Create, maintain, analyze, and regenerate an Open Knowledge Format style sidecar for any project that turns app and data state into portable Markdown knowledge files and optional support artifacts. Use when schema changes, seed data changes, entity models change, sidecar generation changes, project handoff context is needed, or an agent needs project memory without treating the sidecar as source of truth.
---

# OKF Knowledge Sidecar

Maintain a generated, read-only OKF sidecar that packages portable project memory for agents and humans.

Treat the application's database and operational systems as the source of truth. Treat the OKF sidecar as generated memory and analysis output, not as an authoritative app data store.

Model the sidecar as a format, not a platform. Keep it easy to move between repos, tools, and agents without depending on a proprietary runtime.

## Purpose

Use this skill to help a project expose:

- agent context
- project handoff context
- operational memory
- asset history
- relationship reasoning
- explainability
- future graph views

## Core Rule

Do not turn the OKF sidecar into source of truth.

Do not write sidecar content back into the app unless the user explicitly asks for a separate integration workflow. By default, the sidecar is generated from upstream project state and remains read-only.

## Layer Model

Treat the sidecar as three clearly separated layers:

1. OKF Core
2. Portable Sidecar Extensions
3. Icarus Extensions

Do not collapse these layers together in planning, validation, or reporting.

## OKF Core

Follow Google's published Open Knowledge Format framing for the core:

- represent knowledge as a directory of Markdown files
- store structured metadata in YAML frontmatter
- treat each concept as one file whenever practical
- treat the file path as the concept's identity
- use normal Markdown links for cross-concept relationships
- use `index.md` for progressive disclosure within directories when helpful
- use `log.md` for chronological history when the project benefits from change tracking

Require a `type` field in frontmatter for each concept document.

Treat other frontmatter fields such as `title`, `description`, `resource`, `tags`, and `timestamp` as useful but optional. Keep the core minimal and portable.

Do not treat JSON indexes, graph summaries, trust spine structures, or project-specific operational artifacts as part of OKF Core.

## Portable Sidecar Extensions

Treat the following as optional generated support artifacts, not required OKF Core:

- `relationships.json`
- `graph-summary.json`
- generated indexes
- validation reports
- handoff summaries

These artifacts can improve navigation, relationship reasoning, quality checks, and agent handoff, but they remain extensions around the core Markdown knowledge package.

## Icarus Extensions

Treat the following as Icarus-specific extensions rather than general OKF requirements:

- Trust Spine
- evidence chains
- operational memory
- event evidence
- candidate links
- training signals
- audit flows
- compliance mappings
- Bayesian confidence and provenance layers

When working outside Icarus, adapt or omit these concepts instead of assuming they belong in every OKF sidecar.

## Startup

Before making changes:

1. Identify the project's OKF root, project index document, and generator entrypoint.
2. Read the main OKF project index or maintenance document for the target project.
3. Inspect the generator or build script that produces the sidecar.
4. Confirm whether the request is `generation`, `analysis`, or `app integration`.

If the repo does not clearly expose these paths, discover them first with code search. If they still cannot be found, stop and report the missing prerequisite instead of inventing a structure.

## What To Look For

Common signals include:

- `generate-okf` scripts
- sidecar generation commands in `package.json`
- OKF or knowledge directories
- project index Markdown
- concept Markdown with YAML frontmatter
- `relationships.json`
- `graph-summary.json`
- generated entity Markdown
- validation reports
- handoff summaries
- trust, evidence, event, audit, asset, issue, decision, document, system, or location sections

## Task Classification

Classify the request before acting:

- `generation`: update the generator, regenerate the sidecar, or validate determinism
- `analysis`: inspect the sidecar, summarize context, trace relationships, or prepare handoff material
- `app integration`: inspect or adjust how the app exposes or consumes sidecar outputs while keeping the sidecar read-only unless scope is explicitly expanded

Default to the narrowest class that satisfies the task.

## Allowed Work

Allow:

- update the OKF generator
- regenerate the OKF package
- update generated Markdown through the generator only
- update OKF Core concept files through the generator only
- update portable sidecar extensions such as `relationships.json`, `graph-summary.json`, generated indexes, validation reports, and handoff summaries
- update Icarus extensions such as Trust Spine outputs, evidence chains, event evidence, candidate links, training signals, audit flows, compliance mappings, and Bayesian confidence or provenance sections when the target project actually uses them
- summarize what changed

Do not perform the following unless the user explicitly requests them:

- app schema changes
- database writeback from sidecar content
- bidirectional sync
- app route changes
- production data mutations
- turning the sidecar into source of truth

## Execution

Use the project's native OKF generation command. Prefer an existing package script such as:

```bash
npm run generate:okf
```

If no dedicated OKF script exists, use the project's actual generator entrypoint rather than inventing a new command.

After changing generator logic, run generation twice to verify repeatability.

Expect the second run to report no meaningful changes, such as:

```txt
0 created, 0 updated, all unchanged, 0 deleted
```

Equivalent stable output is acceptable if the project uses different wording.

If the second run is not stable:

1. inspect ordering, timestamps, nondeterministic IDs, and serialization behavior
2. fix the generator instead of hand-editing generated outputs
3. rerun until the second pass is unchanged or report the blocker clearly

## Validation

Validate the sidecar as part of normal work when the project exposes enough structure to do so.

Always validate:

- required `type` frontmatter on concept documents
- broken Markdown links
- orphaned concepts
- duplicate path identities

Validate generated artifacts when present:

- generated JSON determinism
- source provenance for generated concepts

For orphan detection, treat a concept as orphaned when it is unintentionally disconnected from the navigable knowledge graph or project indexes based on the project's own conventions. Do not flag intentionally standalone reference notes without evidence they should be linked.

## Working Rules

- Update generated Markdown only through generator changes.
- Keep OKF artifacts portable and human-readable.
- Preserve relationship reasoning and explainability.
- Prefer explicit summaries of inferred and missing fields over silent omission.
- Touch app code only when the task is explicitly about integration or verification.
- Keep the skill project-agnostic: adapt to the repo's naming and layout rather than assuming one fixed folder structure.
- Prefer plain files, normal links, and simple frontmatter over custom runtimes or opaque serialization.
- Keep producer and consumer concerns decoupled: generation logic may be project-specific, but the emitted bundle should be broadly readable by different agents and tools.
- Keep OKF Core distinct from extensions in both implementation and reporting.
- Keep the sidecar read-only unless the user explicitly expands scope.

For expected generated artifacts and reporting fields, read [references/output-checklist.md](references/output-checklist.md).

## Output

After running this skill, report:

- files created
- files updated
- files deleted
- files unchanged
- inferred fields
- missing source fields
- whether generation is stable
- whether app code was touched
- whether lint/build was run

## Mental Model

The app stores facts.

The trust model records how facts become trusted.

The OKF sidecar packages that history into portable memory.

The relationship layer stores graph structure.

Agents use the sidecar to understand the project without rebuilding context from scratch.

The format is the contract. Generators and consumers are replaceable.
