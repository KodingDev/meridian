---
name: execute
description: Use after brainstorm produces an approved spec, or when the user has clear requirements ready to implement
---

<HARD-GATE>
Do NOT claim work is complete without running verification commands and confirming their output. Do NOT trust subagent completion reports without independent verification. Evidence before assertions — always.
</HARD-GATE>

<HARD-GATE>
Migration cutover: do NOT delete source until every caller compiles against the new target. Stubbing callers to restore a green build is a lie — the deleted behavior is gone, not migrated. If the spec says "full cutover" or the user says "port everything", porting means every caller invokes the new shape end-to-end. If scope exceeds the session budget, commit the partial port, leave legacy intact, and report remaining callers in the final summary. Never delete-and-stub to claim done.
</HARD-GATE>

<HARD-GATE>
Completion headline matches reality. "Implementation complete" requires every spec acceptance criterion verified AND every verification command passing. If any criterion is unverified — skipped, deferred, infeasible in this session, or simply not run — the headline is "Implementation incomplete". If any verification command failed — *including* "pre-existing" or "unrelated" failures — the headline is "Implementation blocked". "Pre-existing" is a reason to surface in the body, not a license to upgrade the headline. Users read the headline first; burying blockers under "Open concerns" while declaring success is the failure mode this gate exists to prevent.
</HARD-GATE>

# Execute

Implement an approved spec. Break it into tasks, verify as you go, review at the end.

## Before Starting

### 1. Read and Review the Spec

Load the spec file. Review it critically. If you have concerns — ambiguities, gaps, things that will cause problems during implementation — raise them with the user before writing code. Don't start and hope it works out.

### 2. Execution Preferences

Before asking, parse the user's invoking message for signals that pre-answer these:

- **Subagent signal** — any of "subagent", "parallel", "in parallel", "delegate", "use agents" in the request → **skip the execution-mode question, use Subagent mode**.
- **Commit strategy signal** — "commit after each", "per task", "per-task" → Per-task. "commit at the end" → At-the-end. "don't commit" / "i'll commit" / "no commit" → You-handle-it.
- **Stepping-away signal** — "im going to [shower/sleep/bed/a meeting/work]", "won't be [responsive/around/able to respond]", "see you in [time]", "be autonomous", "when i'm back", "when i get back", "by the time i return" → **activate `/auto` autonomy mode for the rest of the session** (see `auto` skill). This implies: skip remaining preference questions (pick Subagent + Per-task), skip approval gates, bias to completion, commit the work, document defaults in the final summary. Still honor destructive-operation guardrails and still challenge bad approaches via reasoning (not `AskUserQuestion`).

If signals pre-answer both questions, say one line naming what was detected ("Detected: subagent mode, per-task commits, autonomy mode — starting now.") and proceed. Otherwise ask only the unanswered question(s) via `AskUserQuestion`:

1. **Execution mode** — options: "Subagent (Recommended)" (parallel where possible), "Inline" (you do everything)
2. **Commit strategy** — options: "Per-task", "At the end", "I'll handle it"

**Execution mode governs task dispatch:**
- **Subagent:** default to dispatching independent tasks via `meridian:delegate`. Only implement inline when a task requires judgment, architectural decisions, or deep codebase understanding.
- **Inline:** implement everything directly. Do not dispatch subagents.

**Commit strategy governs when `meridian:commit` runs:**
- **Per-task:** commit after each task is verified.
- **At-the-end:** commit once after all tasks pass final verification.
- **You-handle-it:** never commit. User handles it.

All commits — including from subagents — follow `meridian:commit` rules.

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
8. Append entry to the spec's Progress Log section per the Progress Log rules below — typically one line (skip if no spec)
9. If commit strategy is per-task: invoke `meridian:commit`
10. Mark complete

When user feedback introduces new constraints ("stop using partial opacity"), update the spec's User Constraints section (or note in task notes if no spec exists). This persists for future subagents.

### 5. Final Verification and Review

After all tasks:
1. Run the full verification suite — not just the tests you think are relevant
2. Present the final verification results: full suite results (all passed / N failures), files changed summary (count + key files), any open concerns. Keep it to 2-4 lines.
3. Invoke `meridian:review` for code review
4. Triage review findings by class. `review` labels each finding as `material-gap`, `prose-clarity`, or `implementation-detail`:
   - **material-gap findings are blocking.** Fix them before reporting done.
   - **prose-clarity findings are optional.** Apply them if the fix is cheap and the clarity win is real. Skip otherwise.
   - **implementation-detail findings are advisory.** Do not address unless the user asks — these are the "cover-every-edge-case" nits that bloat specs and implementations.
5. Re-verify after fixes
6. If material-gap changes from fixes were substantial, re-review
7. Append a completion entry to the spec's Progress Log: full-suite outcome, review verdict, material-gap defects resolved, any open concerns (skip if no spec)

### 6. Completion

Pick the completion headline by checking the spec's acceptance criteria and verification suite against what actually happened:

- Every acceptance criterion verified + every verification command passed → **"Implementation complete"**
- Any acceptance criterion unverified (skipped, deferred, infeasible, not run) → **"Implementation incomplete — <what wasn't verified>"**
- Any verification command failed, regardless of cause (including pre-existing or out-of-scope) → **"Implementation blocked — <what failed>"**

A failure caused by something you didn't introduce is still a blocker on the headline; it just informs the body's explanation. The body then reports what was built, what was verified, what wasn't, and any open concerns. Ensure everything is committed per the chosen commit strategy.

## Progress Log

Append to a Progress Log section in the spec file. **Purpose:** a fresh agent (after context compaction, a cleared session, or a handoff to a subagent) can resume without re-deriving state. It is a pickup-ready summary, not a step-by-step journal.

After each verified task, append one entry. Include only what applies:
- Task name + verification outcome (always)
- Decisions a future agent couldn't recover from reading the diff
- Deviations from the spec and why
- Open concerns discovered

Do not log every tool call, search, or thought. A clean task with no deviations is a one-line outcome. The model narrates progress in chat natively — do not duplicate that narration here. Facts, not narrative. Append, don't rewrite.

If no spec file exists (direct invocation without brainstorm), skip this — the work is ephemeral enough to live in conversation.

## Scope Discipline

Match change scope to request scope, and don't gold-plate:
- Implement only what the spec asks for — no extra files, abstractions, or flexibility that wasn't requested
- Don't refactor adjacent code "while you're here", and don't add error handling for impossible cases
- "fix X" / "tweak Y" means touch only X / Y; "redesign Z" earns a broader rewrite
- If a subagent returns work beyond the spec, strip it before accepting
- If a small fix requires touching more code than expected, explain why first. Files changed that the user didn't mention mean you over-scoped.

## Integration

- **Predecessors:** `brainstorm`, or direct invocation with clear requirements
- **Successors:** `commit`, `document`
- **May invoke:** `delegate`, `review`, `research`