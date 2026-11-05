---
name: containerize-service
description: Decide whether a service benefits from containerization and, only when warranted, containerize and verify it while preserving explicit operational assumptions.
---

# Containerize Service

## Decision gate

Do not infer that Docker is appropriate merely because this skill is available.

1. Inspect the repository, build process, runtime dependencies, deployment
   environment, and existing operational conventions.
2. Identify the concrete benefit containerization would provide, such as runtime
   consistency, dependency isolation, reproducible deployment, or multi-service
   orchestration.
3. Compare that benefit with added build, security, debugging, storage, and
   maintenance complexity.
4. If no material benefit is established, preserve the simpler native build and
   report the decision without adding Docker artifacts.

## Execution

When containerization is warranted:

1. Select the smallest pattern that satisfies the verified requirements.
2. Create or update the Dockerfile and ignore rules.
3. Configure dependencies, networking, storage, secrets boundaries, and health
   behavior explicitly.
4. Add Compose only when multiple services or local orchestration require it.
5. Build the image.
6. Run the service in its intended topology.
7. Verify startup, health, connectivity, persistence behavior, shutdown, and the
   primary user-visible path.
8. Record image assumptions, ports, volumes, service dependencies, required
   configuration, and deployment constraints as project context.

## Guardrails

- Do not bake secrets or mutable environment-specific state into an image.
- Do not introduce privileged execution without an explicit requirement.
- Do not claim portability from a successful build alone; verify runtime behavior.
- Preserve an existing deployment contract unless the task authorizes changing it.
- Treat platform documentation as retrieved knowledge, not permanent task context.

## Required output

- containerization decision and concrete rationale
- selected pattern or explicit no-change result
- files and operational contracts changed
- verification performed and any gaps
- resulting project-specific assumptions

## Source

- `reference.docker-knowledge-skill-context-separation`

