---
name: review
description: Run an independent, report-only review of a change.
disable-model-invocation: true
---

# Review

Invocation authorizes one risk-proportionate independent review. The default is report-only; modify code only when the user explicitly asks for review and fixes.

## Process

1. Read project instructions and the relevant spec when present. Enumerate the complete change with `git status --short`, including staged, unstaged, deleted, and untracked files. Read both tracked diffs and the full contents of every untracked file in scope; `git diff` alone is never a complete working-tree review.
2. Run the automated checks appropriate to the changed surface before manual review. Report failures instead of hiding them.
3. Select only the lenses justified by the diff:
   - **Correctness & Safety** (`lens-correctness.md`) always.
   - **Craft & Simplicity** (`lens-craft.md`) for implementation, structure, reuse, naming, or maintainability changes.
   - **Performance & Architecture** (`lens-performance.md`) for hot paths, rendering, concurrency, resource use, interface design, or architectural changes.
   - Use all lenses when the user requests a comprehensive review or the blast radius warrants it.
4. Dispatch the selected lenses independently with project instructions, relevant spec, implementation description, only that lens's rubric path, and a complete change manifest. For committed changes, include the diff range. For working-tree changes, include staged and unstaged diffs plus untracked file paths and instruct the reviewer to read their contents. Do not pass conversation history, prior findings, or orchestrator reasoning.
5. Aggregate findings by `file:line` and issue, preserve finding class and category, and reconcile the verdict:
   - approach-level unsoundness: **Do not ship**;
   - localized material gaps: **Fix material gaps and ship**;
   - no material gaps: **Ship it**.
6. Return the deduplicated findings and verdict. Do not pad the report with strengths or speculative nits.

If fixes were explicitly requested, address material gaps and run targeted verification. Start another full review only when a material design change invalidates the first review or the user asks for one.

## Finding classes

- `material-gap`: incorrect, incomplete, unsafe, or materially harmful.
- `prose-clarity`: a concrete, inexpensive clarity defect.
- `implementation-detail`: non-blocking preference; omit unless the user requested exhaustive detail.
