---
name: review
description: Use after completing implementation, before merging, or when the user asks for a review
---

<HARD-GATE>
Do NOT skip automated checks (lint, typecheck, build, test) before dispatching the review subagent. Do NOT approve merging with unaddressed defects.
</HARD-GATE>

# Review

Code review that catches what matters. Dispatched as an isolated subagent so the orchestrator's prior reasoning doesn't contaminate the assessment.

## Process

### 1. Run Automated Checks First

```bash
# Run whatever the project uses — lint, typecheck, build, test
# Fix failures before dispatching the reviewer
# Don't waste review time on things automation catches
```

### 2. Dispatch Review Subagent

Use the template at `reviewer-prompt.md` in this directory. Dispatch as an isolated subagent with:

- **Git diff range** — base SHA from `git merge-base HEAD origin/master` (or equivalent) for initial reviews. For re-reviews after fixing defects, use the commit before fixes began.
- **Description** of what was implemented
- **Project CLAUDE.md** content for conventions
- **Spec file** content if one exists
- **NOT:** conversation history, prior review results, your reasoning

### 3. Act on Results

Every defect must be addressed. There is no "we'll get to it later." That's how slop accumulates.

- Fix all defects
- Re-run automated checks after fixes
- If fixes were substantial, re-review (dispatch a fresh subagent — the previous one's reasoning must not carry over)

## What the Reviewer Evaluates

1. **Code style & conventions** — project rules are enforced. Every violation is a defect.
2. **Framework anti-patterns** — effects for non-sync work, refs where state belongs, missing deps, unnecessary re-renders, oversized components.
3. **Simplification** — code that can be deleted, abstractions serving one call site, premature configurability, wrapper components adding nothing.
4. **Library misuse** — hand-rolled solutions where the stack provides one, wrong data fetching patterns, missing validation at boundaries.
5. **Performance** — unnecessary re-renders, missing lazy loading, unoptimized assets, queries in loops.
6. **Naming** — names that lie, generic names (data, result, item), booleans that don't read as questions.
7. **AI slop** — decorative dividers, narrating the obvious, changelog comments, apology comments, gratuitous variables, defensive code for impossible cases, symmetry theater.
8. **Testing** — missing tests for non-trivial logic, tests shaped around implementation, tests bent to pass, snapshot overuse, missing edge cases.
9. **Security** — exposed secrets, injection vulnerabilities, unsafe input handling, insecure dependencies, missing auth checks, sensitive data in logs.
10. **API design** — wrong doc style, undocumented public API, non-generic signatures, inconsistent conventions.

## What the Orchestrator Sees

The reviewer returns:
- Defects list with file:line references
- Smells
- Simplification opportunities
- Verdict: **ship / fix and ship / do not ship**

No "strengths" section. Working code is the baseline, not an achievement.

## Integration

- **Predecessors:** `execute`, or direct invocation
- **Successors:** Fix defects (back to implementation)
- **May invoke:** —
