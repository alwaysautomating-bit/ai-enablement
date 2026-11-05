---
name: platform-voice-calibration
description: Adapt one source idea or draft across publishing platforms while preserving core authorial voice and meaning. Use for multi-platform content engines, content repurposing, channel-native rewrites, or defining and applying platform voice profiles.
---

# Platform Voice Calibration

Make content native to its platform without making the author unrecognizable.

Read [Platform Voice Calibration](../../knowledge/communication/platform-voice-calibration.md) before defining or applying a profile. Use [Platform Profiles](references/platform-profiles.md) as revisable defaults, not immutable rules.

## Inputs

Collect or infer:

- source material and non-negotiable meaning
- core voice definition and voice invariants
- communication objective and stakes
- audience and context
- target platform
- verified hard platform constraints, when material
- optional mood or custom nuance

If a core voice skill exists, apply it first. Platform calibration is a delivery adapter, not a replacement identity.

## Procedure

1. Extract the source claims, intent, and uncertainty. Do not add authority the source does not contain.
2. State the voice invariants that every version must preserve.
3. Assess objective, audience, and stakes. Reduce tonal flexibility as consequence rises.
4. Load the target platform profile. Separate verified hard constraints from soft defaults.
5. Choose the smallest useful adaptation: length, opening, paragraph shape, pacing, emphasis, interaction pattern, and media references.
6. Apply optional mood only when it does not conflict with meaning, stakes, or voice invariants.
7. Rewrite for the platform. Do not solve the task by truncation alone.
8. Run the identity-cohesion and platform-fluency tests.
9. Identify any unverified platform assumption and request human review before consequential publication.

## Working record

Use this structure when the reasoning needs to remain inspectable:

```yaml
calibration:
  source_meaning: []
  voice_invariants: []
  objective: ""
  stakes: low | medium | high
  audience: ""
  platform: ""
  hard_constraints: []
  soft_defaults: []
  mood_or_custom_note: ""
  transformations: []
  assumptions_to_verify: []
```

## Quality checks

- **Meaning:** Are the facts, claims, uncertainty, and objective intact?
- **Identity:** Does this still sound like the same author?
- **Native delivery:** Does the structure fit how the platform is consumed?
- **Proportionality:** Does the tone respect the stakes?
- **Specificity:** Did the rewrite improve delivery without adding generic platform theater?
- **Reversibility:** Are soft defaults easy to update as evidence changes?

## Guardrails

- Never let a platform profile override truth, safety, legal constraints, stakes, or core voice.
- Do not present provisional lengths or style tendencies as current platform policy.
- Verify time-sensitive technical limits before relying on them.
- Preserve the unified base voice as a resettable source of truth.
- Keep publication and final identity approval with the human owner.
