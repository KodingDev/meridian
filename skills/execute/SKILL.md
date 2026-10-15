---
name: execute
description: Implement an approved spec or clearly defined piece of work.
disable-model-invocation: true
---

# Execute

Implement the scope the user explicitly authorized. Invocation is approval to begin ordinary in-scope implementation; do not ask the user to approve entering the workflow again.

## Invariants

- Do not claim completion without observing risk-appropriate verification.
- Do not trust delegated completion reports without inspecting the diff and evidence yourself.
- Preserve unrelated user changes and keep the diff inside the approved scope.
- Do not delete a migration source until every caller uses and verifies the replacement. If full cutover is not achievable, leave the legacy path intact and report the partial state.
- Do not push, deploy, delete data, force-push, or perform another unrequested external or irreversible action.

## Process

### 1. Ground the work

Read the approved spec or supplied requirements, project instructions, relevant code, and current worktree state. Resolve ordinary reversible implementation details yourself. Ask only when a missing decision would materially change architecture, scope, risk, or an irreversible action.

### 2. Plan proportionately

Break multi-part work into dependency-ordered tasks. Keep a small change inline. Use `meridian:delegate` only for genuinely independent or context-heavy work where isolation materially improves execution; agent count is not evidence of diligence.

### 3. Implement and verify

For each task:

1. Search for existing interfaces, utilities, tests, and conventions before adding competing logic.
2. When the task adds or fixes behavior and a test seam exists, write the failing test first and watch it fail for the expected reason. Take one behavior at a time: red, green, then refactor while the tests stay green.
3. Implement the smallest durable change that satisfies the requirement.
4. Exercise the highest practical real seam: focused tests, typecheck, build, CLI, service, or browser behavior as appropriate.
5. If behavior fails unexpectedly, use `meridian:debug` rather than stacking speculative patches.
6. Check the diff against scope and the spec's User Constraints.
7. If a spec exists, append a concise Progress Log entry containing the task outcome, verification, deviations, and open concerns that a future agent could not recover from the diff.

### 4. Finish

Run the relevant full project checks after focused verification. Formal `meridian:review` and the commit flow are user-owned; do not run them automatically. When a commit message is written, `meridian:commit` holds the conventions.

Report:

- what changed;
- verification commands and observed results;
- any acceptance criterion that remains unverified;
- any known material concern; and
- relevant unrelated failures without treating them as introduced defects.

## Completion

- **Implementation complete:** every requested acceptance criterion is delivered and verified to the task's risk level, and no relevant required check fails.
- **Implementation incomplete:** an acceptance criterion remains undelivered or unverified.
- **Implementation blocked:** a failure or missing human-only decision prevents delivery or meaningful verification.

An unrelated pre-existing failure is reported accurately but does not change the headline unless it prevents verification of the requested work.

## Progress Log

When a spec exists, append one pickup-ready entry after each verified task and one completion entry at the end. Record outcomes, decisions not obvious from the diff, deviations, and open concerns. Do not turn the log into a tool-call journal. Do not stage or commit the spec.

Set the driving spec or sketch's **Status** to `IN PROGRESS` when implementation starts. `SHIPPED <sha>` belongs to whoever commits, since the sha does not exist yet here.
