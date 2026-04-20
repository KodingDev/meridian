---
name: delegate
description: Use when you have 2+ independent tasks, or when isolating heavy work preserves orchestrator context
---

<HARD-GATE>
Do NOT pass conversation history, prior subagent results, or orchestrator reasoning to subagents. Include only the task scope, relevant code context, constraints, and output format.
</HARD-GATE>

# Delegate

Dispatch subagents for isolated work. You think, they execute.

## Default: Delegate

Prefer subagents over inline work. They protect orchestrator context and produce parallelism for free. The model spawns fewer subagents than prior generations by default — push back against that drift. If a task fits the shape, dispatch.

**Delegate when any of these hold:**
- 2+ independent tasks that can run without shared state
- Heavy implementation where context isolation benefits you
- Investigations whose intermediate output you won't need again (codebase surveys, docs reading, spec verification)
- Fresh perspective (no session baggage) is an advantage
- You only need the conclusion, not the raw tool outputs that produced it

**Stay inline only when:**
- You need to reason over the raw tool outputs, not just the conclusion
- The task is tightly coupled to other in-flight changes touching the same files
- The work requires judgment calls or architectural decisions you shouldn't hand off

When in doubt, delegate.

## Prompt Construction

Use the template at `delegation-prompt.md` in this directory as a base.

**Include:**
- Specific scope and clear goal
- All code and context the subagent needs (paste it — don't point to files)
- Constraints (what NOT to touch, what NOT to change)
- Expected output format
- If mid-execution on a spec: the spec file path. The subagent reads User Constraints and the Progress Log to pick up state without inheriting your conversation.

**Exclude:**
- Conversation history
- Prior review results
- Your reasoning about the problem
- Other subagents' results

**Always include this in the prompt:**
> Begin your response with one of: `STATUS: DONE`, `STATUS: DONE_WITH_CONCERNS`, `STATUS: NEEDS_CONTEXT`, or `STATUS: BLOCKED`. Then report: what you did, files changed, and any concerns.

## Handling Results

- **DONE:** Verify independently — check the diff, run tests. Never trust the report alone.
- **DONE_WITH_CONCERNS:** Read concerns first. If about correctness or scope, address before proceeding.
- **NEEDS_CONTEXT:** Provide missing info, re-dispatch.
- **BLOCKED:** If context problem, provide more. If too complex, break it down. If the plan is wrong, consult the user.

## Narrow Decomposition Check

Before dispatching, verify your decomposition covers the full scope. If you only assign 3 subtopics when there are 5, the missing 2 will never get done. Enumerate broadly, then verify coverage.

## Model Selection

Match capability to task complexity:
- **Mechanical tasks** (isolated functions, clear specs, 1-2 files): fastest available model
- **Integration tasks** (multi-file, pattern matching): standard model
- **Architecture and review tasks**: most capable model

When the platform supports it, consider using lower `effort` settings for mechanical subagents — they don't need deep thinking for straightforward implementation work.

## Integration

- **Predecessors:** `execute`, or direct invocation
- **Successors:** Returns to caller
- **May invoke:** —
- **On completion:** Re-evaluate the next user message against the routing table. Returns to calling skill.
