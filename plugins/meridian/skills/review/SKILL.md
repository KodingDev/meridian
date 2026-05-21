---
name: review
description: Use after completing implementation, before merging, or when the user asks for a review
---

<HARD-GATE>
Do NOT skip automated checks (lint, typecheck, build, test) before dispatching the review subagent. Do NOT approve merging with unaddressed material-gap defects.
</HARD-GATE>

<HARD-GATE>
Default mode is **report-only**. `review` produces a findings list and verdict; it does NOT modify code unless the invoking request explicitly asks for fixes ("review and fix", "fix any issues you find", "apply the suggestions"). If you are invoked by `execute`, return findings — `execute` decides what to address based on finding class. The orchestrator/user acts on findings, not `review`.
</HARD-GATE>

# Review

Code review that catches what matters. Dispatched as three isolated lens subagents running in parallel, so the orchestrator's prior reasoning doesn't contaminate the assessment.

By default, review **reports** — it does not fix. This is deliberate: a spec or diff getting reviewed and then auto-edited makes it impossible to see what the reviewer flagged vs. what was changed in response. Findings go up; fixes happen at the caller's discretion.

## Process

### 1. Run Automated Checks First

Run whatever the project uses — lint, typecheck, build, test. Fix failures before dispatching the reviewer; don't waste review time on things automation catches.

### 2. Dispatch Three Lens Passes

The review fans out into exactly three lens passes — always all three, regardless of what changed. Each pass is the same `meridian:reviewer` agent reviewing the full diff against one lens's rubric; an agent naturally reports only on the dimensions present in its slice of the diff (a config-only diff may legitimately come back empty from a lens). The lenses and their rubric files are listed under [Lenses](#lenses) below.

Compute the diff range: base SHA from `git merge-base HEAD origin/master` (or equivalent) for initial reviews. For re-reviews after fixing defects, use the commit before fixes began.

Dispatch all three lenses **in a single message** — three `Agent` calls with `subagent_type: meridian:reviewer`. Each dispatch's prompt body contains:

- A **lens-role line**: "You are the **<lens name>** pass. Review the diff against ONLY the rubric below, in depth."
- The full contents of that lens's rubric file (copy it into the prompt)
- The diff range
- The project CLAUDE.md content (conventions)
- The spec file content, if one exists
- A description of what was implemented

Do NOT pass: conversation history, prior review results, the orchestrator's reasoning, or the other lenses' rubrics or results. Each pass reviews the diff on its own merits.

### 3. Aggregate

Wait for all three lens passes to return, then merge them into one report:

- **Dedup findings** — key on `file:line` + the issue. Collapse same-line / same-issue duplicates to one; keep same-line / different-category findings separately. Dedup is a safety net, expected to fire rarely — the three lenses cover disjoint dimensions, so identical cross-lens findings are uncommon.
- **Concatenate** Smells and Simplification Opportunities across lenses (informational; no dedup).
- **Reconcile verdicts** in two ordered steps. Each lens emits its verdict per the reviewer doctrine, where "Do not ship" means the change is fundamentally wrong — not merely that it carries a localized material gap (those are "Fix material gaps and ship").
  1. **Normalize each lens verdict (downgrade check, runs first).** For every lens that returned "Do not ship", inspect its cited rationale. If the rationale asserts the chosen approach or structure is wrong, keep "Do not ship"; if every cited item is instead a fixable defect (specific things to change, not "this design is wrong"), treat that lens's verdict as "Fix material gaps and ship".
  2. **Take most-severe of the normalized verdicts.** Any remaining "Do not ship" → **Do not ship**; else if any finding is `material-gap` → **Fix material gaps and ship**; else → **Ship it**.

  The downgrade step always precedes most-severe, so a localized defect a lens mislabeled "Do not ship" cannot escalate the merged verdict. A merged "Do not ship" therefore always reflects a genuine approach-level problem.

Present one merged findings list (each finding keeps its `finding-class` label and originating category) and one verdict.

### 4. Return Results

`review` is report-only by default (see the hard-gate above). Return findings to the caller, classified by `finding-class` (below). The caller — `execute`, or the user directly — decides what to address.

Only act on findings directly if the invoking request explicitly said to ("review and fix", "apply the suggestions"). In that case: fix material-gap findings first, consider prose-clarity on a cost-benefit basis, skip implementation-detail. Then re-run automated checks, and re-review if material-gap fixes were substantial (dispatch fresh subagents — the previous passes' reasoning must not carry over).

## Lenses

Every review dispatches all three. Each lens's rubric lives in its own file; the orchestrator copies the relevant file's contents into that lens's dispatch prompt (per step 2).

| Lens | Rubric file | Dimensions |
|------|-------------|------------|
| **Correctness & Safety** | `lens-correctness.md` | Security, Testing, Library Misuse, Logic & Error Handling |
| **Craft & Simplicity** | `lens-craft.md` | Code Reuse, Simplification, Quality Patterns, AI Slop, Code Style & Conventions, Naming |
| **Performance & Architecture** | `lens-performance.md` | Efficiency, Rendering Performance, Framework Anti-Patterns, API Design |

## Finding Classification

Every finding must be labeled with one of three classes. This is non-negotiable — unclassified findings are noise.

- **`material-gap`** — the change is incorrect, incomplete, or actively harmful: bugs, security issues, broken API contracts, missing behavior the spec requires, tests that don't test the thing, type unsoundness, dead paths that will blow up in production. Must be addressed before merge. If the reviewer is reviewing a spec rather than code, `material-gap` also covers missing requirements, ambiguous decisions that will cause implementer divergence, and contradictions between sections.
- **`prose-clarity`** — the code or spec works, but a specific phrasing is confusing, a name misleads, or a section would benefit from a clarifying sentence. Cheap wins only. This class is for actual-clarity issues, not "would be nicer if..." speculation.
- **`implementation-detail`** — the reviewer has an opinion on how a competent implementer should handle a detail that is neither wrong nor unclear. These are the "cover-every-edge-case" nits — defensive null checks for impossible inputs, extra hooks a competent maintainer would add later if needed, alternative names that are equally good. Do not emit these unless the reviewer is genuinely confident the issue will cause harm. When in doubt, drop the finding entirely rather than labeling it `implementation-detail`.

Any finding the reviewer is tempted to label `implementation-detail` should be re-examined: is this a real defect in disguise? If not, delete it from the output. The bar is "will a competent implementer get this wrong in a way that matters." If no, it doesn't belong in a review.

## What the Orchestrator Sees

After aggregating the three lens passes, the review returns:
- A findings list — the deduped union across the three lenses — with file:line references AND a `finding-class` label per finding (`material-gap` | `prose-clarity` | `implementation-detail`)
- Smells (unclassified but honest observations — not required action)
- Simplification opportunities (explicitly labeled as such; the caller decides)
- Verdict: **Ship it / Fix material gaps and ship / Do not ship**, reconciled to most-severe across the lenses per step 3. `Do not ship` requires the approach to be fundamentally wrong — not merely the presence of material gaps. Fixable material-gap findings produce `Fix material gaps and ship`.

No "strengths" section. Working code is the baseline, not an achievement. No list padding — if there are only two material gaps and no clarity issues, return exactly that.

## Integration

- **Predecessors:** `execute`, or direct invocation
- **Successors:** Fix defects (back to implementation)
- **May invoke:** —
- **On completion:** Re-evaluate the next user message against the routing table. Common next: fix defects, then `commit`.
