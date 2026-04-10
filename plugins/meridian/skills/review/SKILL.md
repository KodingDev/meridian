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

### 2. Select Review Dimensions

Inspect the changed files (`git diff --stat`) and classify the changes:

**Core dimensions (always included):**
1. Code style & conventions
2. Simplification
3. AI slop
4. Security
5. Testing

**Context dimensions (include based on what changed):**
- UI components (`.tsx`/`.jsx` with JSX, style files): add Framework anti-patterns, Performance (re-renders, lazy loading), Naming
- API/data layer (routes, services, database): add API design, Library misuse, Performance (queries, data fetching)
- Pure logic/algorithms (utils, business logic): add Naming, Testing (edge cases emphasis)
- Infrastructure/config/dependencies: core dimensions only
- Mixed changes: include all context dimensions that apply to any changed file

If changes don't clearly match any context category, use core dimensions only.

**Design review:** If the changes are primarily visual/UI (majority of changed files are components/styles, minimal new business logic) and the project uses a dedicated design review tool, suggest the user invoke it. Meridian review catches code quality in UI components but does not evaluate visual design, layout decisions, or UX patterns. This is a judgment call — when in doubt, mention it.

### 3. Dispatch Review Subagent

Use the template at `reviewer-prompt.md` in this directory. Copy the relevant dimension blocks from the Dimension Reference section below into the template's `{REVIEW_DIMENSIONS}` placeholder. Dispatch as an isolated subagent with:

- **Git diff range** — base SHA from `git merge-base HEAD origin/master` (or equivalent) for initial reviews. For re-reviews after fixing defects, use the commit before fixes began.
- **Selected review dimensions** — core + context dimensions from step 2
- **Description** of what was implemented
- **Project CLAUDE.md** content for conventions
- **Spec file** content if one exists
- **NOT:** conversation history, prior review results, your reasoning

### 4. Act on Results

Every defect must be addressed. There is no "we'll get to it later." That's how slop accumulates.

- Fix all defects
- Re-run automated checks after fixes
- If fixes were substantial, re-review (dispatch a fresh subagent — the previous one's reasoning must not carry over)

## Dimension Reference

Copy the relevant blocks into the reviewer prompt's `{REVIEW_DIMENSIONS}` placeholder.

### Code Style & Conventions
Enforce project rules. Every violation is a defect. Check types vs interfaces, any usage, component typing patterns, formatting, lint disable syntax, Tailwind patterns — whatever the project specifies.

### Simplification
- Code that can be deleted entirely
- Abstractions serving one call site (inline them)
- Utility functions for one-time operations (delete them)
- Premature configurability (YAGNI)
- Nested ternaries (extract to early returns or lookups)
- Wrapper components adding nothing

### AI Slop
- Decorative section dividers (// ── Section ──)
- Comments restating the next line in English
- Changelog comments (git history exists)
- Apology comments (// Hack: ..., // TODO: refactor)
- Gratuitous intermediate variables
- Defensive code for impossible cases
- Empty else blocks, exhaustive switches with identical arms

### Security
- Exposed secrets or credentials
- Injection vulnerabilities (SQL, XSS, command injection)
- Unsafe user input handling
- Insecure dependencies
- Missing authentication/authorization checks
- Sensitive data in logs or error messages

### Testing
- Missing tests for non-trivial logic
- Tests shaped around implementation (testing HOW not WHAT)
- Tests bent to pass (expectations adjusted to match buggy output)
- Snapshot overuse (change detectors, not behavior tests)
- Missing edge cases (empty, null, boundary values)
- Flaky by design (timing, network, global state deps)

### Framework Anti-Patterns
- Effects for anything other than external sync (data transforms, event handling = wrong)
- Refs where state belongs (refs for non-JSX values only)
- Missing or incorrect dependency arrays
- Inline object/array/function creation causing re-renders
- Components over 150 lines (suspicious), over 250 (defect)
- Props drilling through >2 levels when composition or context is cleaner
- useState for derived values

### Performance
- Unnecessary re-renders
- Missing Suspense/lazy for heavy components
- Unoptimized images
- Database queries in loops
- Large bundle imports that could be dynamic

### Naming
- Names that lie about content
- Generic names (data, result, item, info, handler)
- Booleans that don't read as questions (use is/has/should/can)
- Function names that don't describe what they do

### Library Misuse
- Hand-rolled solutions where the stack provides one
- Manual state management where query libraries handle it
- Missing validation at system boundaries
- Wrong data fetching strategy
- N+1 queries, missing relations

### API Design
- Exported functions missing doc comments (internal helpers don't need them)
- Doc comments that just restate the signature
- Non-generic API design (raw types where a generic works)
- Inconsistent function signatures in the same module
- Boolean flag params that should be separate functions or options

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
- **On completion:** Re-evaluate the next user message against the routing table. Common next: fix defects, then `commit`.
