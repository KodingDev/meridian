---
name: commit
description: Commit message and pull request conventions, and the one-clean-commit flow. Use when writing a commit message, opening or updating a pull request, or when another skill needs these conventions.
argument-hint: "[optional: push, pr]"
---

# Commit

**Conventions** govern how commit messages and pull request descriptions are written, whenever one is written. The **commit flow** runs when the user asks for it.

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

## Both artifacts are public

They are read by an engineer who was not there: months later, holding the diff, with no memory of the work. Write for that reader.

**Neither is a diary.** Describe what the code does and why it does it. The session that produced it is invisible to that reader and belongs in conversation instead: attempts and dead ends, rebases and force-pushes, review rounds, conflicts, local environment and machine paths, which host or agent typed it, unrelated pre-existing failures, and back-references like "as discussed" or "per feedback". A sentence that would confuse someone who never saw the session is a diary entry. Cut it.

**Repository convention outranks this skill.** Read recent merged commits and pull requests, and use the pull request template when one exists: its subject grammar, its sectioning, its label and issue-linking practice. Introduce no section the repository does not already use.

## Commit messages

- Subject in the repository's convention, imperative mood, one line, no trailing period.
- A body when the change needs a reason: why it exists, what behavior changed. Self-evident changes take no body.
- Reference issues in the repository's established format.
- One commit is one coherent change.

## Pull request descriptions

A description earns its place by getting a reviewer to a correct judgment quickly. The diff already says what changed line by line; the description says what the reviewer cannot reconstruct. Reviewers read top-down and stop early, so order matters.

**Lead with why.** The problem, the user-visible symptom, or the constraint that forced the change. Rationale is what engineers value most for understanding intent, and it is what lets a reviewer judge whether the approach solves the right problem rather than only whether the code is correct.

**Then what changed, at the altitude of behavior.** What the system does differently now. Name the design decisions a reviewer might otherwise question, and say why the alternative lost.

**Say what feedback you want.** Naming the review you need is the strongest single predictor of reviewer engagement and acceptance, and the element most often omitted. Point at the files that matter, propose a review order for a multi-file change, and flag what you are unsure about. "The retry logic in `client.ts` is the risky part; the rest is mechanical" is worth more than three paragraphs of summary.

**State what was verified.** Which tests, which cases, which environment, what was observed. "Tested locally" asserts nothing. Where verification was partial, name what remains untested rather than implying coverage that does not exist.

**Flag what changes the reader's world.** Breaking changes, migrations, new configuration or environment variables, feature flags, dependency changes, and security-relevant surfaces: authentication, permissions, sensitive data handling. A reviewer who discovers a migration in the diff has already stopped trusting the description.

**Show evidence where it is cheaper than prose.** Screenshots or a short recording for user-visible changes; before and after for behavioral ones.

**Scale to the change.** Completeness alone does not improve review outcomes. A one-line fix under eight headings buries the one thing that matters; a trivial change earns a sentence. Cut every heading that would otherwise hold "N/A".

**Keep the change reviewable.** One pull request, one purpose. When a change is too large to hold, propose the split rather than apologising for the size.

**Self-review first.** Read your own diff and confirm the checks pass before requesting review. Leftover debug output, commented-out code, and unrelated formatting churn spend the reviewer's attention on your behalf.
