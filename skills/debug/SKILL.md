---
name: debug
description: Diagnose bugs, test failures, and unexpected behavior from evidence before changing code.
---

# Debug

Find the cause before choosing a fix. The fault may be in project code, configuration, dependencies, the environment, or tooling; let evidence locate it.

## Discipline

1. Read the complete failure evidence: errors, stack traces, logs, screenshots, and relevant diffs.
2. Reproduce the issue when practical. If reproduction is unsafe or unavailable, gather the closest direct evidence and state the limitation.
3. Trace the failing path and compare it with a working path or documented contract.
4. Form one specific hypothesis and test it with the smallest useful observation or change.
5. Fix the cause, not merely the visible symptom.
6. Add or update a regression test when it provides durable value, then run proportionate verification.

Do not require ceremony that adds no evidence. A trivial, directly proven defect can move quickly; an ambiguous or multi-component failure deserves deeper instrumentation. If an external API or library contract matters, invoke `meridian:research`.

After several failed hypotheses, stop stacking changes. Reassess the model of the system and surface the uncertainty to the user.
