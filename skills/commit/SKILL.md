---
name: commit
description: Conventions for commit messages and pull request descriptions, and the flow that produces one clean commit. Use when writing a commit message, opening or updating a pull request, or when another skill needs commit or PR description conventions.
argument-hint: "[optional: push, pr]"
---

# Commit

Two things live here. **Conventions** govern how commit messages and pull request descriptions are written, and apply whenever one is being written. The **commit flow** produces one clean commit and runs when the user asks for it.

## Authorization

Consulting this skill authorizes nothing. Committing, pushing, and creating or editing a pull request are separate outward actions; each requires an explicit user request, and each request authorizes that action once. A request to commit is not a request to push, and a request to push is not a request to open a pull request.

## Invariants

- Never include AI attribution, session links, or tool trailers.
- Never commit secrets, environment files, local Meridian artifacts, or unintended generated/binary files.
- Preserve unrelated working-tree changes.
- Never force-push or rewrite shared history without explicit authorization.

## Commit flow

1. Inspect `git status`, staged and unstaged diffs, and recent commit style.
2. Identify the files belonging to the requested change. Ask only when staged scope is materially ambiguous; otherwise stage the intended files narrowly.
3. Exclude local-only or unrelated files without reverting their contents.
4. Draft the message per the conventions below.
5. Commit without a redundant approval prompt.
6. If push was explicitly requested, push to the current tracking branch. Ask before choosing a remote or branch that cannot be inferred, and before any destructive recovery from rejection.

## What both artifacts are for

A commit message and a pull request description are read by someone who was not present. Assume a competent engineer, months later, with the diff in front of them and no memory of the work.

**Follow the repository's existing convention before any advice here.** Read recent merged commits and pull requests, and use the repository's pull request template when one exists. Convention in the repository outranks convention in this skill: its subject grammar, its sectioning, its label and issue-linking practice. Do not introduce sections a repository does not use.

**Describe the resulting code, not the work that produced it.** Everything about the session is invisible to the reader and belongs in conversation instead:

- how many attempts it took, what was tried and abandoned, what a review or a reviewer said
- rebasing, conflicts, force-pushes, branch surgery, cherry-picks
- local environment detail, machine-specific paths, which host or agent produced the change
- pre-existing failures unrelated to the change, and unrelated flakes
- "as discussed", "as requested", "per feedback", and other references to invisible context

Write what the code now does and why it does it. If a sentence would confuse a reader who never saw the session, cut it.

## Commit messages

- Subject in the repository's convention, imperative mood, one line, no trailing period.
- A body when the change needs a reason. Explain why the change exists and what behavior changed. Skip the body for changes whose reason is self-evident.
- Reference issues in the repository's established format.
- One commit is one coherent change. Do not bundle unrelated work to save a commit.

## Pull request descriptions

A useful description gets a reviewer to a correct judgment quickly. It is not a summary of the diff, which the reviewer can already read. Order matters: reviewers read top-down and stop early.

**Lead with why.** The problem, the user-visible symptom, or the constraint that forced the change. Rationale is the element engineers value most for understanding intent, and it is what lets a reviewer judge whether the approach solves the right problem rather than only whether the code is correct.

**Then what changed, at the altitude of behavior.** What the system does differently now. Name the design decisions a reviewer might otherwise question, and say why the alternative was rejected. Do not narrate file by file.

**Say what feedback you want.** Naming the kind of review you need is the strongest single predictor of reviewer engagement and acceptance, and it is the element most often omitted. Point at the files that matter, propose a review order for a multi-file change, and flag anything you are unsure about or that deserves scrutiny. "The retry logic in `client.ts` is the risky part; the rest is mechanical" is worth more than three paragraphs of summary.

**State what was verified.** Which tests, which cases, which environment, what was observed. "Tested locally" asserts nothing. If verification was partial, say what remains untested rather than implying coverage that does not exist.

**Flag anything that changes the reader's world.** Breaking changes, migrations, new configuration or environment variables, feature flags, dependency changes, and security-relevant surfaces: authentication, permissions, sensitive data handling. A reviewer who learns about a migration from the diff has already lost trust in the description.

**Include evidence where it is cheaper than prose.** Screenshots or a short recording for user-visible changes. Before and after for behavioral changes.

**Scale the description to the change.** Completeness alone does not improve review outcomes; a one-line fix with eight headings wastes the reviewer's attention and buries the one thing that matters. A trivial change earns a sentence. Cut every heading that would be empty rather than filling it with "N/A".

**Keep the change reviewable.** A pull request should have one purpose. When a change is large enough that a reviewer cannot hold it, say so and propose the split rather than apologising for the size in the description.

**Self-review before requesting review.** Read your own diff and confirm the checks pass. Leftover debug output, commented-out code, and unrelated formatting churn are the reviewer's time spent on your behalf.
