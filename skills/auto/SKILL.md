---
name: auto
description: Modifier that runs the active task in autonomous mode — skip clarifying questions and approval gates, make reasonable defaults, produce reviewable artifacts before the user returns
argument-hint: "<the task, command, or request to run autonomously>"
---

<HARD-GATE>
`/auto` never acts alone. It is a modifier. If the user invoked `/auto` with no trailing request, ask them once — in plain text — what task to run autonomously, then stop. Do not invent a task.
</HARD-GATE>

# Auto

The "I'm going for a shower" skill. The user is stepping away and wants something concrete to review when they return. `/auto` itself does no work — it sets the *mode* the rest of the work runs in.

## When to Use

Either of:

- **Explicitly** — user invokes `/meridian:auto <task>`, e.g. `/meridian:auto /meridian:brainstorm add a copy button`, `/meridian:auto fix the flaky login test`.
- **Auto-activated** — the `meridian` entry skill detected a stepping-away signal in the user's message (e.g. "I'm going to shower", "be autonomous", "see you in an hour") and activated these principles without the prefix. The routing and behavior are identical from here.

## Process

1. **Parse the wrapped task.** Everything after `/meridian:auto` is the real request. Route it through the meridian table normally — `/auto` does not change *what* skill runs, only *how*.

2. **Activate autonomy mode for the remainder of the conversation.** All downstream skills and tool calls honor the principles below until the user sends a session-end signal (see principle 8) or the work reaches a natural stopping point. Mid-flow user messages do not automatically end autonomy — they're re-classified as constraints, scope changes, or session-end signals per principle 8.

3. **Hand off to the appropriate skill** (or just proceed with the request directly if no skill applies), with autonomy mode active.

## Autonomy Principles

These override the default behavior of other skills *only on the axes listed*. Everything else — research rigor, review quality, commit cleanliness, the Challenge Protocol's reasoning — still applies.

### 1. No gating questions where a reasonable default exists

`AskUserQuestion` is for genuine forks that need a human. In autonomy mode:
- **Skip approval prompts.** Sketch approval, spec approval, commit-message approval, "ready to execute?" — all auto-approve. The user pre-approved by invoking `/auto`.
- **Skip clarifications that have a sensible default.** Pick the obvious choice, state it in the final summary.
- **Still ask** when: the task is genuinely ambiguous and defaults would likely be wrong; a destructive or irreversible action (force push, data deletion, production deploy, credential rotation) would otherwise be silent; the user's stated intent is self-contradictory.

When unsure whether to ask: don't. Document the decision instead.

### 2. Bias to completion over breadth — honestly

Finish one demonstrable thing rather than starting three. If the wrapped task is large, pick the most load-bearing slice, ship it, and note the remainder as follow-ups in the final summary.

**"Complete" means complete in the sense the user asked for.** Partial progress with legacy intact is fine and honest; deleting source and leaving stubs so the build stays green is not — that's `execute`'s cutover gate, and it binds in every autonomy invocation too. Commit the real partial work and report the remaining surface as a follow-up.

### 3. Document every non-obvious decision

The user returns to a diff, a commit, and your summary message. That summary must include:
- What was built
- Every default you chose on their behalf, with a one-line rationale
- Any blockers hit and how you worked around them
- What you left for them to decide

Short bullets. No prose.

### 4. Commit the work

If the task produces code, commit it before finishing — following the `commit` skill's rules. Unfinished work stranded in the working tree is worse than no work at all; the user can't review what they can't see. Do not push unless the wrapped task explicitly said to.

### 5. Respect destructive-operation guardrails

Autonomy is not recklessness. Do not, without explicit instruction in the wrapped task:
- Force-push, rebase shared branches, delete branches
- `rm -rf`, drop tables, delete production data
- Skip hooks, disable signing, bypass CI
- Rotate credentials, change billing, change auth config
- Merge to main/master

If the wrapped task requires one of these, do it. Otherwise stop and leave a note in the summary.

### 6. Report blockers honestly

If something truly cannot proceed without user input:
- Make the best reasonable partial progress first
- Commit the partial work
- End with a clear "BLOCKED ON:" line in the summary stating what you need

Do not spin. Do not silently stop. Do not fabricate a decision on something load-bearing.

### 7. Still challenge bad approaches — just don't ask

The Challenge Protocol's *reasoning* still applies: surface concerns with evidence, weigh alternatives. But instead of `AskUserQuestion`, pick the strongest path, implement it, and explain the tradeoff in the summary. The user can course-correct on return.

### 8. Re-classify each new user message — autonomy isn't deafness

Autonomy skips gating questions; it does NOT mean treating mid-flow user messages as background noise. The user is still driving — they're just not micromanaging. Every new user message during autonomy must be classified into one of three buckets before deciding what to do with it:

- **New constraint** ("make sure it works on mobile", "no animations", "use existing utils", "no AI attribution") — append to the active spec/sketch's User Constraints. Propagate to any in-flight subagent on its next checkpoint. Constraints accumulate; do not silently swallow.
- **Scope reduction or pivot** ("ignore the overwatch part, just do these 4", "drop the migration", "actually scrap that", "forget what I said about X") — stop in-flight subagents at the next safe checkpoint, prune the task list, proceed with the reduced scope. Do not keep shipping work the user just told you not to do. When phrasing is ambiguous between constraint and pivot, treat any message containing "actually", "ignore", "instead", "drop", "scrap", "just do", "forget" as a pivot.
- **Session-end signal** — "i'm back", "im home", "im here", "supervise", "i'll take it from here", "stop committing", "no need to commit", "no commit", "i got this", "ill drive". End autonomy mode. The user is now driving interactively. From this point: ask before commits, ask before new tasks, follow normal interactive rules. Acknowledge the handover in one line ("Autonomy mode off — back to interactive.") and proceed.

The reason this matters: skipping `AskUserQuestion` is not the same as ignoring the user. Mid-flow messages carry information that changes what "the wrapped task" means. Without re-classification, autonomy keeps shipping work the user has already updated, withdrawn, or taken back — and the diff at the end no longer matches what they want to come home to.

## Final Summary Format

When the wrapped task finishes (or blocks), end with a message in this shape:

```
## Done
- <what shipped>
- <commit SHA(s) if any>

## Decisions
- <default chosen>: <one-line reason>
- ...

## Follow-ups
- <what's left>
- ...

## Blocked (omit if none)
- <what I need from you>
```

## Integration

- **Predecessors:** Direct invocation only
- **Successors:** Any skill via the wrapped task
- **May invoke:** Any skill (runs them in autonomy mode)
- **On completion:** Autonomy mode persists until a session-end signal (principle 8) — mid-flow messages are re-classified as constraints or scope changes, not exits.
