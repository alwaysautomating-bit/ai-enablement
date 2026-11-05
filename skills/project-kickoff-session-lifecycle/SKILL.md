---
name: project-kickoff-session-lifecycle
description: Create and maintain a lightweight project operating system with a small, deterministic set of project memory files and repeatable session rituals. Use when Codex is asked to kick off a new software project, standardize project documentation, reduce navigation cost, create a durable project memory, or close out a work session by reconciling project state, backlog, decisions, schema, and git hygiene.
---

# Project Kickoff Session Lifecycle

Treat documentation as an operating system, not a storage closet. Prefer a small number of files with strict responsibilities over sprawling notes.

Read [references/project-operating-system.md](references/project-operating-system.md) before creating or renaming project memory files.

## Working Rules

- Keep the operating system small. Default to 3 core files and grow only when the project earns it.
- Give each file one job.
- Preserve navigability over completeness.
- Prefer deterministic rituals over long prose.
- Use top-level project files for active operating context and reserve `docs/` for secondary material.
- Managed operating files are the project's working memory.
- Do not replace, split, rename except for date suffix updates, duplicate, or relocate managed operating files without explicit user approval.
- When a managed operating file is edited, rename it so its date suffix matches the latest edit date.
- Keep exactly one live file per managed document type. Rename the existing file instead of creating dated duplicates.
- Treat the build log as append-only.
- Never summarize prior sessions.
- Never compress history.
- Never rewrite previous entries.

## Managed Files

Always maintain:

- `PROJECT_MM-DD-YYYY.md`
- `BACKLOG_MM-DD-YYYY.md`
- `BUILD_LOG_MM-DD-YYYY.md`

Create only when the condition is true:

- `SCHEMA_MM-DD-YYYY.md` if a database exists
- `API_MM-DD-YYYY.md` if another developer or agent could not reasonably infer the external contract from the code
- `ARCHITECTURE_MM-DD-YYYY.md` if the system has grown beyond a simple single-surface app or more than 10 significant components
- `DECISIONS_MM-DD-YYYY.md` when the first architectural or stack decision worth preserving appears
- `DEPLOYMENT_MM-DD-YYYY.md` when deployment exists or must be planned concretely

Use uppercase stems exactly as listed above. Use zero-padded month and day, for example `BUILD_LOG_07-24-2026.md`.

## Kickoff Workflow

Follow this sequence when starting a new project or installing this operating system into an existing repo:

1. Identify whether the project needs its own dedicated directory and clean identity.
2. Create or confirm the project root.
3. Create the minimum operating files.
4. Create conditional files only if the triggering condition already exists.
5. Initialize git if needed, or inspect the existing repo state before making branch decisions.
6. Create a working branch when the repo uses branching.
7. Seed each file with the minimum required structure instead of long-form documentation.

If the project was split out from another repo or product, clean the identity immediately:

- Update package or app name
- Update visible app title and metadata
- Rewrite `README.md` around the new purpose and scope
- Remove leftover references to the prior project
- Prefer a fresh git history when the user wants true isolation

## Kickoff File Content

Seed files with concise structure only.

For `PROJECT`, include:

- Name
- Started
- Status
- Purpose
- Problem
- Features
- Feature History
- Architecture
- Current Phase
- Last Updated

For `BACKLOG`, include:

- Now
- Soon
- Later
- Someday

For `BUILD_LOG`, append one dated session block per session with:

- Session Goals
- Completed
- Decisions
- Problems Found
- Files Created
- Files Modified
- Next Session

For `SCHEMA`, include:

- Tables
- Purpose
- Relationships
- Indexes
- Recent Changes

For `DECISIONS`, record:

- Date
- Decision
- Reason
- Alternatives Considered
- Consequences

For `FEATURE HISTORY`, append dated entries for notable user-facing, system, workflow, or capability changes. Keep it high-level so `PROJECT` also acts as a concise changelog.

Keep `ARCHITECTURE` high-level. Show system shape, not implementation details.

## Session Closeout Workflow

End every substantive session with the same ritual:

1. Update `BUILD_LOG` with what happened in the session.
2. Record files created in the `Files Created` section and files changed in the `Files Modified` section.
3. For every file listed, include its filename or filepath and a one-sentence `Purpose:` note that explains why it was created or changed.
4. Update `BACKLOG` to reflect what is now next.
5. Update `PROJECT` if features, phase, status, or architecture changed.
6. Update `SCHEMA` if the data model changed.
7. Update `DECISIONS` when a choice was made that future contributors will otherwise forget.
8. If a document is retired or replaced, leave breadcrumbs instead of silently deleting context.
9. Rename every edited managed file so its date suffix matches the current edit date.
10. Run the most relevant verification steps you can.
11. Commit when the user wants version-control changes recorded.
12. Merge and delete the working branch only when the repo workflow and the user request call for it.

Do not claim that commit, push, merge, or branch deletion happened unless you actually performed those actions.

## Decision Rules

Use these defaults:

- Start with the minimum file set, not the maximum file set.
- Add a conditional file only when the trigger is already true or clearly imminent.
- Prefer updating an existing managed file over creating a new note elsewhere.
- Create `API` based on contract clarity, not route count.
- If information does not fit one of the operating files and is still important, place it under `docs/`.
- If a repo already has equivalent files, reconcile them into the operating system instead of duplicating them.
- If a document is replaced, moved, or retired, record that change in `BUILD_LOG` and leave a visible breadcrumb in the old file.

## Retire Rule

When retiring or replacing a non-operating document:

1. Record the change in `BUILD_LOG`, including what moved and why.
2. Replace the old file contents with a short tombstone instead of deleting it immediately.
3. Use this format:

```md
Moved to:

PROJECT_07-24-2026.md

Archived:
07-24-2026
```

4. Preserve the old path long enough for humans and agents to follow the breadcrumb.

Do not retire or replace managed operating files without explicit user approval.

## Output Expectations

When reporting work, summarize:

- Which operating files were created or updated
- Which files were renamed because of the date suffix rule
- Which conditional files were added and why
- Any git actions taken
- Any follow-up gaps the next session should pick up
