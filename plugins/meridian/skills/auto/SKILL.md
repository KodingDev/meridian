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

User-invoked via `/meridian:auto <task>` — e.g. `/meridian:auto /meridian:brainstorm add a copy button`, `/meridian:auto fix the flaky login test`, `/meridian:auto triage these three issues`. Never auto-invoked by the router.

## Process

1. **Parse the wrapped task.** Everything after `/meridian:auto` is the real request. Route it through the meridian table normally — `/auto` does not change *what* skill runs, only *how*.

2. **Activate autonomy mode for the remainder of the conversation.** All downstream skills and tool calls honor the principles below until the user returns (sends a new message) or the work reaches a natural stopping point.

3. **Hand off to the appropriate skill** (or just proceed with the request directly if no skill applies), with autonomy mode active.

## Autonomy Principles

These override the default behavior of other skills *only on the axes listed*. Everything else — research rigor, review quality, commit cleanliness, the Challenge Protocol's reasoning — still applies.

### 1. No gating questions where a reasonable default exists

`AskUserQuestion` is for genuine forks that need a human. In autonomy mode:
- **Skip approval prompts.** Sketch approval, spec approval, commit-message approval, "ready to execute?" — all auto-approve. The user pre-approved by invoking `/auto`.
- **Skip clarifications that have a sensible default.** Pick the obvious choice, state it in the final summary.
- **Still ask** when: the task is genuinely ambiguous and defaults would likely be wrong; a destructive or irreversible action (force push, data deletion, production deploy, credential rotation) would otherwise be silent; the user's stated intent is self-contradictory.

When unsure whether to ask: don't. Document the decision instead.

### 2. Bias to completion over breadth

Finish one demonstrable thing rather than starting three. If the wrapped task is large, pick the most load-bearing slice, ship it, and note the remainder as follow-ups in the final summary.

### 3. Document every non-obvious decision

The user returns to a diff, a commit, and your summary message. That summary must include:
- What was built
- Every default you chose on their behalf, with a one-line rationale
- Any blockers hit and how you worked around them
- What you left for them to decide

Short bullets. No prose.

### 4. Commit the work

If the task produces code, commit it before finishing — following the `commit` skill's rules (no AI attribution, clean message, no stray files). Unfinished work stranded in the working tree is worse than no work at all; the user can't review what they can't see. Do not push unless the wrapped task explicitly said to.

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
- **On completion:** The wrapped task's `On completion` applies. Re-evaluate the next user message against the routing table; autonomy mode ends when the user sends a new message.
