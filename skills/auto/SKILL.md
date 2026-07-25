---
name: auto
description: Run a task autonomously with reversible defaults and a reviewable handback.
disable-model-invocation: true
argument-hint: "<task>"
---

# Auto

`/auto` is an explicit user-owned modifier. Everything after the invocation is the task. If no task is supplied, ask what to run and stop.

## Authority

Invocation authorizes Meridian to:

- choose reasonable reversible implementation details;
- continue through ordinary friction without waiting for approval;
- use appropriate internal disciplines and delegation;
- produce the artifacts required by the task; and
- commit completed in-scope code before handback.

It does not authorize scope expansion, push, deploy, force-push, destructive data operations, credential or billing changes, shared-branch rewriting, or merge.

## Operating discipline

- Ask only when the missing answer is human-only, materially changes scope or architecture, or gates an irreversible action.
- Finish the requested outcome rather than starting adjacent work.
- Keep legacy behavior intact when a migration cannot be completed safely.
- Treat new user messages as current authority: absorb constraints, stop withdrawn scope, and end autonomous operation when the user takes back control.
- Commit only files belonging to the task, per `meridian:commit`.
- Stop when the professional standard's completion condition is met, not when elapsed time feels sufficient and not after inventing extra work.

## Handback

Report what shipped, verification evidence, commits created, defaults chosen, unresolved decisions, and genuine blockers. Keep the handback concise and reviewable.
