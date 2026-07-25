---
name: commit
description: Commit message and pull request description conventions, and the clean-commit flow. Use when committing, opening or updating a pull request, or when another skill needs these conventions.
argument-hint: "[optional: push, pr]"
---

<HARD-GATE>
The conventions below are always available. The flow is not: committing, pushing, and creating or editing a pull request each require an explicit user request for that action. A request to commit is not a request to push, and a request to push is not a request to open a pull request.
</HARD-GATE>

# Commit

## Invariants

- Never commit secrets, environment files, local Meridian artifacts, or unintended generated/binary files.
- Never force-push or rewrite shared history without explicit authorization.

## Commit flow

1. Inspect `git status`, staged and unstaged diffs, and recent commit style.
2. Identify the files belonging to the requested change. Ask only when staged scope is materially ambiguous; otherwise stage the intended files narrowly.
3. Exclude local-only or unrelated files without reverting their contents.
4. Draft the message per the conventions below.
5. Commit without a redundant approval prompt.
6. If push was explicitly requested, push to the current tracking branch. Ask before choosing a remote or branch that cannot be inferred, and before any destructive recovery from rejection.
7. Move the `Status` line of any spec or sketch this work delivers to `SHIPPED <sha>`.

## Both artifacts

They are read by an engineer who was not there: months later, holding the diff, with no memory of the work.

**Every sentence stands alone.** Describe what the code does and why it does it, in terms a reader holding only the diff can follow. "As discussed", "after the rebase", "addressed the review comment", "still failing from before" all fail that test: they point at a session the reader never saw. Circumstantial detail belongs in conversation instead.

**Repository convention outranks this skill.** Read recent merged commits and pull requests, and use the pull request template when one exists: its subject grammar, its sectioning, its label and issue-linking practice. Introduce no section the repository does not already use.

## Commit messages

- Subject in the repository's convention, imperative mood, one line, no trailing period.
- A body when the change needs a reason: why it exists, what behavior changed. Self-evident changes take no body.
- One commit is one coherent change.

## Pull request descriptions

A description earns its place by getting a reviewer to a correct judgment quickly. The diff already says what changed line by line; the description says what the reviewer cannot reconstruct. Reviewers read top-down and stop early, so order matters.

**Title first.** Often the only thing a reviewer reads before deciding when to pick it up. One line, the repository's convention, naming the outcome rather than the activity.

**Lead with why.** The problem, the user-visible symptom, or the constraint that forced the change, so a reviewer can judge whether the approach solves the right problem rather than only whether the code is correct.

**Then what changed, at the altitude of behavior.** What the system does differently now. Name the design decisions a reviewer might otherwise question, and say why the alternative lost.

**Say what feedback you want, and in what order.** Point at the files that matter, propose a review order for a multi-file change, and flag what you are unsure about. "The retry logic in `client.ts` is the risky part; the rest is mechanical" is worth more than three paragraphs of summary.

**Link the issue** in the repository's established format, using its closing keywords where that is the convention.

**State what was verified.** Which tests, which cases, which environment, what was observed. "Tested locally" asserts nothing. Where verification was partial, name what remains untested rather than implying coverage that does not exist.

**Flag what changes the reader's world.** Breaking changes, migrations, renamed or removed configuration keys, new environment variables, feature flags, dependency changes, and security-relevant surfaces: authentication, permissions, sensitive data handling.

**Show evidence where it is cheaper than prose.** Screenshots or a short recording for user-visible changes; before and after for behavioral ones.

**Scale to the change.** A one-line fix under eight headings buries the one thing that matters; a trivial change earns a sentence. Cut every heading that would otherwise hold "N/A".

**Self-review first.** Read your own diff and confirm the checks pass before requesting review. Leftover debug output, commented-out code, and unrelated formatting churn spend the reviewer's attention on your behalf.
