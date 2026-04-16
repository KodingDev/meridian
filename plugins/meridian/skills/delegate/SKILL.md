---
name: delegate
description: Use when you have 2+ independent tasks, or when isolating heavy work preserves orchestrator context
---

<HARD-GATE>
Do NOT pass conversation history, prior subagent results, or orchestrator reasoning to subagents. Include only the task scope, relevant code context, constraints, and output format.
</HARD-GATE>

# Delegate

Dispatch subagents for isolated work. You think, they execute.

## The Primary Test

Before choosing inline vs subagent, ask: **"Will I need this tool output again, or just the conclusion?"**

- **Just the conclusion** → subagent. Tool outputs (file reads, search results, intermediate exploration) live in the subagent's context and get discarded; only the synthesized result returns. Orchestrator stays lean.
- **I'll keep reasoning over it** → inline. You need the raw evidence in your own context for follow-up decisions.

This is the decision that matters most. The heuristics below are secondary — they help when the primary test is ambiguous.

## When to Use

- 2+ independent tasks that can run without shared state
- Heavy implementation where context isolation benefits you
- Tasks where fresh perspective (no session baggage) is an advantage
- Investigations whose intermediate output you won't need again (codebase surveys, docs reading, spec verification)

## When NOT to Use

- Tasks requiring full conversation context
- Exploratory work where you need to reason about the raw results
- Tightly coupled tasks touching the same files
- When you're the right one to do the work — don't delegate for the sake of it

## Prompt Construction

Use the template at `delegation-prompt.md` in this directory as a base.

**Include:**
- Specific scope and clear goal
- All code and context the subagent needs (paste it — don't point to files)
- Constraints (what NOT to touch, what NOT to change)
- Expected output format

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
