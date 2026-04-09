---
name: debug
description: Systematic root-cause investigation before any fix attempts. Use when encountering any bug, test failure, or unexpected behavior. No fixes without understanding what's actually broken.
---

# Debug

Find the root cause, then fix it. Not the other way around.

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes. This is not optional. This is not skippable because it "looks obvious." Obvious bugs have root causes too.

## Phase 1 — Root Cause Investigation

1. **Read error messages completely.** Stack traces, line numbers, error codes. Don't skip past them. They often contain the answer.
2. **Reproduce consistently.** Exact steps, every time. If you can't reproduce, gather more data — don't guess.
3. **Check recent changes.** Git diff, recent commits, new dependencies, config changes, environmental differences.
4. **Gather evidence in multi-component systems.** Log at each component boundary. Run once. Analyze where data goes wrong. Don't guess which layer is broken.
5. **Trace data flow.** Find where bad values originate. Trace upstream to the source. Fix at source, not at symptom.

## Phase 2 — Pattern Analysis

1. **Find working examples** of similar code in the codebase.
2. **Compare working vs broken** — list every difference, however small. Don't assume "that can't matter."
3. **Understand dependencies and assumptions** the code makes.

## Phase 3 — Hypothesis and Testing

1. **Form a single hypothesis:** "X is the root cause because Y." Be specific.
2. **Test minimally** — the smallest possible change, one variable at a time.
3. If it works, proceed to Phase 4. If not, form a new hypothesis. **Do not stack fixes.**

## Phase 4 — Implementation

1. **Write a failing test** that reproduces the bug.
2. **Implement a single fix** addressing the root cause.
3. **Verify** — test passes, no regressions.
4. **If 3+ fix attempts have failed: stop.** This is not a failed hypothesis — this is likely a wrong architecture. Discuss with the user before attempting more fixes.

## Research Integration

If the bug involves an external API or library behaving unexpectedly, invoke `meridian:research` to verify expected behavior against live docs before forming hypotheses. Don't assume you know how the library works.

## Red Flags — Stop and Restart Phase 1

If you catch yourself thinking any of these, you've skipped the process:

- "Quick fix for now, investigate later"
- "Just try changing X and see"
- "I don't fully understand but this might work"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow
- 3+ fix attempts in different places revealing new problems each time

## When the Process Reveals No Root Cause

If systematic investigation reveals the issue is truly environmental, timing-dependent, or external:
1. You've completed the process — that's fine
2. Document what you investigated
3. Implement appropriate handling (retry, timeout, error message)
4. Consider invoking `meridian:document` to capture the investigation for future sessions

95% of "no root cause" cases are incomplete investigation.
