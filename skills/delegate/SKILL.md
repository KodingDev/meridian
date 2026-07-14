---
name: delegate
description: Isolate independent or context-heavy work when parallelism or fresh context materially improves the task.
---

# Delegate

Delegation is an internal execution mechanism, not a default proof of diligence.

## Use when

- two or more tasks are genuinely independent;
- a bounded investigation's intermediate context is disposable;
- a fresh blind perspective is part of the method; or
- heavy mechanical work would crowd out the orchestrator's integration judgment.

Stay inline when work shares files or state, raw outputs are needed for the main reasoning, or the task depends on user intent or architectural judgment.

## Dispatch

Give each agent only its concrete scope, relevant facts, constraints, and required output format. Do not pass conversation history, prior reviewer conclusions, or orchestrator reasoning. Match model capability and effort to task complexity.

Require a status (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`), files changed, verification performed, and concerns. The orchestrator independently inspects the diff, runs relevant checks, and owns the integrated conclusion.
