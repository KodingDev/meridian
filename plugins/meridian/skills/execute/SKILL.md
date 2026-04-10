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
2. Implement directly or dispatch via `meridian:delegate` (per execution mode preference)
3. Run verification — tests, typecheck, lint, whatever the project uses
4. If verification fails: invoke `meridian:debug`. Do not guess-fix.
5. If subagent was used: verify independently. Check the diff. Run tests yourself. Do not trust the subagent's success report.
6. If commit strategy is per-task: invoke `meridian:commit`
7. Mark complete

### 5. Final Verification and Review

After all tasks:
1. Run the full verification suite — not just the tests you think are relevant
2. Invoke `meridian:review` for code review
3. Fix all defects from the review
4. Re-verify after fixes
5. If changes from fixes were substantial, re-review

### 6. Completion

Report what was built, what was verified, and present any open concerns. Ensure everything is committed per the chosen commit strategy.

## Compaction Resilience

Long sessions will have their context compacted automatically. Before this happens — or when you sense you're deep into a session — save progress state:
- Which tasks are done, which remain
- Key decisions made and why
- Current state of the implementation
- Any open concerns

Write this to a progress file or task notes so a fresh context window can pick up where you left off.

## Overengineering Guard

Opus 4.6 has a documented tendency to overengineer — creating extra files, adding unnecessary abstractions, building flexibility that wasn't asked for. During execution:
- Only implement what the spec asks for
- Don't refactor adjacent code "while you're here"
- Don't add error handling for impossible scenarios
- Don't create abstractions for one-time operations
- If a subagent returns extra work that wasn't in the spec, remove it

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
