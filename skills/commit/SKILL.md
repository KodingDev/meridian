---
name: commit
description: Inspect and commit the intended local changes cleanly.
disable-model-invocation: true
---

# Commit

Invocation authorizes one clean commit of the intended local work. If the user also requested push or PR creation in the invocation, that authorizes the named outward action once.

## Invariants

- Never include AI attribution.
- Never commit secrets, environment files, local Meridian artifacts, or unintended generated/binary files.
- Preserve unrelated working-tree changes.
- Never force-push or rewrite shared history without explicit authorization.

## Process

1. Inspect `git status`, staged and unstaged diffs, and recent commit style.
2. Identify the files belonging to the requested change. Ask only when staged scope is materially ambiguous; otherwise stage the intended files narrowly.
3. Exclude local-only or unrelated files without reverting their contents.
4. Draft a concise message that follows repository conventions and describes the resulting code, not the session journey.
5. Commit without a redundant approval prompt.
6. If push was explicitly requested, push to the current tracking branch. Ask before choosing a remote/branch that cannot be inferred or before any destructive recovery from rejection.

Use an existing PR template or recent merged-PR convention when PR work was explicitly requested. Public artifacts omit rebasing history, local environment notes, pre-existing failures, and other circumstantial session detail.
