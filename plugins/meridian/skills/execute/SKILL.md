---
name: execute
description: Use after brainstorm produces an approved spec, or when the user has clear requirements ready to implement
---

<HARD-GATE>
Do NOT claim work is complete without running verification commands and confirming their output. Do NOT trust subagent completion reports without independent verification. Evidence before assertions — always.
</HARD-GATE>

# Execute

Implement an approved spec. Break it into tasks, verify as you go, review at the end.

## Before Starting

### 1. Read and Review the Spec

Load the spec file. Review it critically. If you have concerns — ambiguities, gaps, things that will cause problems during implementation — raise them with the user before writing code. Don't start and hope it works out.

### 2. Execution Preferences

Ask once via `AskUserQuestion`, respect for the entire session. Use two questions in a single call:

1. **Execution mode** — options: "Subagent (Recommended)" (parallel where possible), "Inline" (you do everything)
2. **Commit strategy** — options: "Per-task", "At the end", "I'll handle it"

**Execution mode governs task dispatch:**
- **Subagent:** default to dispatching independent tasks via `meridian:delegate`. Only implement inline when a task requires judgment, architectural decisions, or deep codebase understanding.
- **Inline:** implement everything directly. Do not dispatch subagents.

**Commit strategy governs when `meridian:commit` runs:**
- **Per-task:** commit after each task is verified.
- **At-the-end:** commit once after all tasks pass final verification.
- **You-handle-it:** never commit. User handles it.

All commits — including from subagents — follow `meridian:commit` rules: no AI attribution, verify staging, present messages for approval.

## Process

### 3. Break Into Tasks

Identify discrete implementation units from the spec. Use TaskCreate/TaskUpdate to track progress. Sequence tasks logically — dependencies first.

### 4. Implement Each Task

For each task:
1. Mark it in progress
2. Search the codebase for existing utilities, similar features, and data access patterns relevant to this task. Do not hardcode values that exist in data files or utilities. Do not reimplement existing logic.
3. Implement directly or dispatch via `meridian:delegate` (per execution mode preference). If dispatching: include User Constraints from the spec in the subagent prompt. If inline: consult User Constraints before implementing.
4. Run verification — tests, typecheck, lint, whatever the project uses
5. If verification fails: invoke `meridian:debug`. Do not guess-fix.
6. If subagent was used: verify independently. Check the diff. Run tests yourself.
7. Present a brief verification summary: what was checked, results, any discrepancies. Also check against User Constraints — violations are defects. For UI tasks, check pattern consistency with existing pages. Keep to 2-4 lines — facts only.
8. If commit strategy is per-task: invoke `meridian:commit`
9. Mark complete

When user feedback introduces new constraints ("stop using partial opacity"), update the spec's User Constraints section (or note in task notes if no spec exists). This persists for future subagents.

### 5. Final Verification and Review

After all tasks:
1. Run the full verification suite — not just the tests you think are relevant
2. Present the final verification results: full suite results (all passed / N failures), files changed summary (count + key files), any open concerns. Keep it to 2-4 lines.
3. Invoke `meridian:review` for code review
4. Fix all defects from the review
5. Re-verify after fixes
6. If changes from fixes were substantial, re-review

### 6. Completion

Report what was built, what was verified, and present any open concerns. Ensure everything is committed per the chosen commit strategy.

## Compaction Resilience

In long sessions, save progress state (tasks done/remaining, key decisions, open concerns) to task notes before context compacts.

## Overengineering Guard

Opus 4.6 has a documented tendency to overengineer — creating extra files, adding unnecessary abstractions, building flexibility that wasn't asked for. During execution:
- Only implement what the spec asks for
- Don't refactor adjacent code "while you're here"
- Don't add error handling for impossible scenarios
- Don't create abstractions for one-time operations
- If a subagent returns extra work that wasn't in the spec, remove it

## Change Proportionality

Match the scope of your change to the scope of the request:
- User says "fix X" → change only what's needed to fix X
- User says "tweak Y" → adjust Y, nothing else
- User says "redesign Z" → then a broader rewrite is appropriate

If a small fix requires touching more code than expected, explain why before doing it. Never rewrite what works to fix what doesn't. If you changed files the user didn't mention, you probably over-scoped.

## Quality Gates

These are not negotiable:

- **No completion claims without fresh verification evidence.** Run the command. Read the output. Then claim the result.
- **No "should pass" or "looks correct."** Evidence or silence.
- **No trusting subagent success reports.** Verify independently.
- **No moving to next task with failing verification.** Fix it or escalate.
- **No skipping the final review.** Every implementation gets reviewed.

## Integration

- **Predecessors:** `brainstorm`, or direct invocation with clear requirements
- **Successors:** `commit`, `document`
- **May invoke:** `delegate`, `review`, `research`
- **On completion:** Re-evaluate the next user message against the routing table. Common next: `review`, `commit`.
