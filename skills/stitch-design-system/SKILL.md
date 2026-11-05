---
name: stitch-design-system
description: Extract, author, validate, upload, or apply a source-grounded DESIGN.md using Google Stitch. Use when importing a codebase into Stitch, reverse-engineering a frontend design system, creating a Stitch design system from DESIGN.md, applying it to screens, or choosing among the Stitch design/build workflows.
---

# Stitch Design System

Use `DESIGN.md` as the controlled handoff between a product's real sources and generated Stitch screens.

Read [Design System as a Human-and-Machine Interface](../../knowledge/design-systems/design-system-as-interface.md) and the [DESIGN.md contract](references/design-md-contract.md). The Stitch connector is an implementation dependency; the extracted design intent must remain useful without it.

## Route the request

| User outcome | Route |
| --- | --- |
| Quick design extraction without Stitch access | Read the codebase and draft `.stitch/DESIGN.md` |
| Framework-aware extraction from source | Inspect the stack, tokens, shared styles, and representative components |
| Extraction from an existing Stitch project | Retrieve project, screens, HTML, screenshots, and project design metadata |
| Create a Stitch design system | Draft and review `DESIGN.md`, then upload and register it |
| Apply a design system to screens | Resolve the design-system asset and exact screen instances, then apply |
| Full code-to-design migration | Extract `DESIGN.md`, capture representative UI, upload assets, and validate the resulting screens |
| Design-to-code implementation | Hand off to the appropriate framework-specific build skill after the design is approved |

## Source-grounded extraction

1. Read repository instructions before inspecting the application.
2. Establish the product purpose and authoritative content. Reuse names, labels, states, and terminology from source material; do not invent placeholder product meaning.
3. Detect the framework and styling stack from manifests and configuration.
4. Inspect theme and token files first, then global styles, shared components, representative screens, and isolated overrides.
5. Extract product content, visual identity, and information architecture as separate evidence layers.
6. Record confirmed rules, repeated conventions, conflicts, and inferences distinctly.
7. Create `.stitch/DESIGN.md` using structured frontmatter and semantic Markdown.
8. Validate colors, typography, spacing, geometry, component states, layout, responsiveness, and accessibility against the sources.

## Stitch connector workflow

Use an available Stitch MCP connector that provides equivalent operations to the PORK [Stitch Design Interface](../../tools/stitch-design/tool.yaml).

For an existing project:

1. List or resolve the exact project.
2. List screens and choose representative instances.
3. Retrieve screen metadata and use the connector's authenticated file-download operation for HTML or screenshots.
4. Retrieve project metadata and existing design systems.
5. Synthesize or revise `DESIGN.md` locally.

For a reviewed `DESIGN.md`:

1. Present the display name, key colors, typography, shape, and material assumptions.
2. Obtain explicit authorization before uploading or changing the remote project.
3. Upload the UTF-8 `DESIGN.md` using the connector's supported encoding.
4. Immediately create the project design system from the returned screen instance.
5. Re-read the project or design-system list and verify the created asset.

To apply the design system:

1. Re-read the project immediately before mutation.
2. Resolve the asset identifier from the design-system list.
3. Select real screen instances only; exclude design-system instances.
4. Pass only the required instance identifier and source-screen reference.
5. Verify every intended screen after application.

## Guardrails

- Never upload, apply, replace, or delete a remote design asset without user authorization for that external change.
- Do not fetch authenticated Stitch download URLs directly when the connector exposes a file-download operation.
- Do not confuse a source screen ID with a screen-instance ID.
- Do not include position or dimension fields when the apply operation accepts only instance identity.
- Treat technical limits and tool schemas as versioned adapter knowledge; verify them against the active connector.
- Preserve the existing product identity unless the user explicitly requests a redesign.
- Keep a local, reviewable `DESIGN.md` as the source artifact.

## Output

Return:

- source paths inspected
- confirmed tokens and component rules
- conflicts and inferred decisions
- the path to `DESIGN.md`
- validation results
- Stitch project, design-system, and screen identifiers only when used
- external changes performed or still awaiting authorization
