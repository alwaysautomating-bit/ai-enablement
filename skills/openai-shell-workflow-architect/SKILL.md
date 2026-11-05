---
name: openai-shell-workflow-architect
description: Design workflows where skills define the process and shell executes the work to generate real artifacts. Use when a task needs files, scripts, commands, builds, conversions, diagrams, document generation, or repeatable asset pipelines instead of conversation-only output.
---

# OpenAI Shell Workflow Architect

## Overview

Use this skill to design the execution layer for an OpenAI workflow.

The core model is:

- skill = process, templates, rules, examples, and instructions
- shell = execution layer
- workspace or container = persistent artifact surface

Use this skill when the real question is not just "what should the agent say?" but "what should the agent actually run and create?"

## Mental Model

Treat shell as the primitive that turns a skill into a working system.

The stack is:

- agent
  - chooses, coordinates, and reasons
- skill
  - defines the workflow, standards, templates, boundaries, and output contract
- shell
  - runs commands, scripts, programs, services, and validations
- workspace
  - stores generated files, intermediate outputs, logs, and finished artifacts

Without shell, the workflow often ends in a good conversation.

With shell, the workflow can produce:

- markdown
- backlog files
- diagrams
- structured outputs
- generated documents
- transformed assets
- validation logs
- updated project files

## Use This Skill When

Use this skill when any of the following are true:

- a skill needs to create or update real files
- a workflow should generate artifacts instead of just advice
- the agent needs to run scripts or command-line tools
- the process depends on validation commands, conversion steps, or build steps
- the user wants a repeatable pipeline such as PRD generation, backlog generation, report generation, or documentation assembly
- the workspace should persist artifacts across a session

## Design Questions

For any requested workflow, answer these questions:

1. What belongs in the skill?
2. What belongs in shell execution?
3. What artifacts should be created?
4. What should persist in the workspace?
5. What validation should run before completion?
6. What should be reported back to the user?

## What Belongs In The Skill

Put these in the skill:

- workflow steps
- decision rules
- templates
- formatting rules
- quality standards
- naming conventions
- required inputs
- required outputs
- failure handling
- escalation rules

The skill should explain how to do the work, not duplicate every shell command inline unless that detail is part of the reusable process.

## What Belongs In Shell

Put these in shell execution:

- running scripts
- generating files
- converting formats
- building diagrams
- compiling or bundling outputs
- running linters or tests
- validating generated artifacts
- collecting logs or command results

Shell is where the workflow becomes operational.

## Workflow Pattern

When designing a shell-backed workflow, use this pattern:

1. Identify the desired artifact set.
2. Define the skill contract.
3. Define the shell execution plan.
4. Define the workspace persistence model.
5. Define validation.
6. Define reporting and stop conditions.

### 1. Identify The Desired Artifact Set

List the concrete outputs the workflow should produce, such as:

- `PRD.md`
- `architecture.md`
- `backlog.json`
- `report.md`
- `diagram.mmd`
- `brief.docx`

If the artifacts are unclear, the workflow is not ready for shell design.

### 2. Define The Skill Contract

The skill should specify:

- trigger conditions
- inputs
- required context sources
- required templates
- naming rules
- workflow steps
- output schema or artifact list
- safety boundaries

### 3. Define The Shell Execution Plan

Specify:

- commands to run
- scripts to call
- files to read
- files to write
- external tools required
- order of execution
- retry rules if a command fails

Prefer deterministic shell steps over vague "generate this somehow" instructions.

### 4. Define The Workspace Persistence Model

Decide what persists across the session:

- generated files
- temporary working files
- logs
- cached inputs
- reusable intermediate outputs

Use this when the user may return later and continue work from the same artifact set.

### 5. Define Validation

Validation should check the real output, not just the reasoning.

Examples:

- file exists
- format is valid
- script completed successfully
- generated markdown is linked correctly
- document exports without failure
- tests or checks pass

### 6. Define Reporting And Stop Conditions

The final workflow should report:

- what was created
- what commands ran
- what validation passed or failed
- what assumptions were made
- what still needs human input

Stop once the requested artifacts are generated and the relevant validation is complete, or when a blocking error prevents safe completion.

## Founder OS Pattern

For Founder OS style workflows, use this architecture:

- file search or MCP provides context
- skill defines the operating process
- shell generates the artifacts
- Codex coordinates the workflow

Typical examples:

- PRD generation
- backlog generation
- architecture pack generation
- doctrine synthesis
- document update workflows

## Output Format

When using this skill, produce:

- `workflow_goal`
- `artifacts`
- `skill_contents`
- `shell_execution_plan`
- `workspace_persistence`
- `validation_plan`
- `risks_or_blockers`

Keep the output structured and implementation-oriented.
