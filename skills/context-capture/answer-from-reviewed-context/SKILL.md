---
name: answer-from-reviewed-context
description: Answer questions about responsibilities, decisions, rules, exceptions, and changes using only authorized, human-reviewed operational context with source provenance.
metadata:
  domain: context-capture
  source: AI Enablement Workspace operational-context workflow, promoted 2026-09-29 and migrated 2026-10-20
---

# Answer from Reviewed Context

Use only operational context the requester may access and a human has confirmed.

1. Search reviewed operational memory for the names and topic in the question.
2. For ownership, chronology, or change questions, traverse the relevant entity relationships.
3. Treat confirmed-but-superseded items as history, not current state.
4. Keep operational time separate from communication time.
5. Cite who said what, where, and when; retrieve full evidence when needed.
6. If confirmed context does not cover the question, say so. Absence of an accessible result is not evidence of absence.

Never present an unreviewed candidate as fact. Keep outside assumptions separate from confirmed context, and do not infer hidden restricted details.
