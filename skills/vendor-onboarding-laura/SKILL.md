---
name: vendor-onboarding-laura
description: Execute or explain Laura's SYNCD vendor onboarding workflow. Use when Codex needs to create a new vendor in SYNCD, trace why a vendor is blocked from payment, follow the VendorIntake through onboarding, promotion, and verbal verification, or convert this workflow into SOPs, skills, or implementation guidance tied to the SYNCD codebase at C:\Projects\SYNCD.
---

# Vendor Onboarding Laura

## Overview

Use the live SYNCD implementation as the source of truth.
Treat vendor onboarding as a controlled progression from intake to operational vendor to verbally verified payment path.

Read [references/syncd-source-map.md](references/syncd-source-map.md) when you need exact files, endpoints, or authoritative implementation anchors.

## Core Model

Use these meanings consistently:

- `VendorIntake`: onboarding is incomplete; the vendor is not operational yet.
- `Vendor.verificationStatus = UNVERIFIED`: the vendor has been promoted into the system and required onboarding data is on file, but AP has not yet verbally verified banking/payment details.
- `Vendor.verificationStatus = VERIFIED`: AP completed verbal verification and logged it through the wire verification flow.
- `Vendor.verificationStatus = DISPUTED`: human override state; do not auto-sync away from it.

Never describe promoted vendors awaiting AP confirmation as `PENDING` unless you are quoting stale code or notes. Collapse that meaning to `UNVERIFIED`.

## Workflow

Follow this order:

1. Create a `VendorIntake`, not a `Vendor`, for any new vendor.
2. Generate the onboarding link from the intake token.
3. Require W-9 upload before onboarding submission completes.
4. Collect banking details through the public onboarding flow and store them encrypted.
5. Move the intake to review-ready state.
6. Promote the intake into an operational `Vendor`.
7. Treat the promoted vendor as `UNVERIFIED` until AP verbally verifies the bank/payment path.
8. Log verbal verification through the wire verification path before allowing money movement.

## Decision Rules

Use this decision tree:

- If the vendor does not exist yet, start with `VendorIntake`.
- If the intake is missing W-9 or onboarding submission, do not promote it.
- If the intake is promoted but banking is not verbally verified, call the vendor `UNVERIFIED`.
- If a user asks why payment is blocked, inspect missing verification evidence first: W-9, current verified wire instructions, or disputed status.
- If the request is to explain or document the process, describe the workflow in terms of intake, promotion, and AP verbal verification.
- If the request is to modify code, update the SYNCD implementation rather than inventing a parallel onboarding model.

## Execution Notes

- Prefer these implementation surfaces in order:
  1. `src/lib/vendor-intake/intake-service.ts`
  2. `src/lib/vendor-intake/promote.ts`
  3. `src/app/api/vendor-intakes/...`
  4. `src/app/api/onboarding/[token]/route.ts`
  5. `src/lib/vendor-verification.ts`

- When describing vendor state to Laura, prefer plain operational language:
  - `in intake`
  - `ready for review`
  - `promoted but unverified`
  - `verified for money movement`

- When you need exact code references, read the source map reference before searching broadly.

## Typical Requests

- "Onboard this new vendor in SYNCD."
- "Why is this vendor blocked from payment?"
- "Show me the authoritative create-vendor logic."
- "Turn Laura's vendor onboarding flow into a repeatable SOP or skill."
- "Rename stale `pending verification` wording to `unverified` where appropriate."

## Validation

Before concluding work on this flow:

1. Confirm whether the request is about intake, promotion, or verbal verification.
2. Confirm the language uses `UNVERIFIED` for promoted-but-not-verified vendors.
3. If you edited code, run the narrowest relevant tests or route checks available.
