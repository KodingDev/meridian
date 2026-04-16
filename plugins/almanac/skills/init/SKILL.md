---
name: init
description: Scan the vault, detect conventions, confirm with the user, and write .almanac.md.
---

# Init

You are the `init` skill. You detect the user's existing vault conventions and write `.almanac.md` after explicit user approval. You do not force conventions. You do not scaffold folders. You do not store absolute paths.

## Assumption

Almanac is invoked from within the vault. `cwd` IS the vault root. You do not walk upward. You do not probe elsewhere for `.obsidian/`. You do not store absolute paths anywhere.

## CLI

```
/almanac:init
/almanac:init --edit FIELD    # interactive edit of one field in existing .almanac.md
```

## Preflight

1. Verify `cwd` looks like a vault: `.obsidian/` present OR at least one `.md` file exists. Else stop with: `Run /almanac:init from inside your vault.`
2. If `.almanac.md` already exists and `--edit FIELD` was NOT given, prompt via `AskUserQuestion`:
   - `Re-detect` — rescan conventions and offer a new config preview
   - `Edit specific settings` — go to field-picker
   - `Abort` — stop
3. If `--edit FIELD` was given, skip detection; prompt the user for the new value of just that field, then rewrite `.almanac.md` preserving all other fields.

## Detection

Scan `cwd` for signals. Use `Glob`, `Read`, and direct directory listings — do NOT walk above `cwd`.

**Folder signals** — check for any of these existing folders:
- `Daily Notes`, `Daily`, `Journal`
- `Inbox`, `_Inbox`, `📥`
- `Learning`, `Reference`, `Notes`, `Research`

Record which exist. None existing is fine — that's a flat vault.

**Note samples** — sample up to 5 recently-modified `.md` files. Use `ls -t` (e.g. `ls -t **/*.md 2>/dev/null | head -20` via `Bash`, or `Glob` with sort-by-mtime semantics) to get candidates, then skip the root `README.md` if present. Avoid `find`-style recursion that walks `.obsidian/`. For each sample:
- Frontmatter presence (YAML between `---` fences at top)
- Date format used in frontmatter (`YYYY-MM-DD`, `DD/MM/YYYY`, etc.)
- Tag style: `flat` (`#tag`) or `nested` (`#parent/child`)
- Wiki-link style: `title` (`[[Note]]`) or `path` (`[[folder/Note]]`)
- Heading style: `atx` (`#`) or `setext` (underline with `===`)
- Common custom frontmatter keys (record the union)

**Empty vault** — if the vault has zero `.md` files, skip note-sample detection. Use defaults (see below) as the initial suggestion, but prompt the user to confirm each one.

## Defaults (only when nothing is detectable)

- `daily-notes`: `Daily Notes/`
- `reflect-output`: `Learning/`
- `investigate-output`: `Reference/`
- `tag-style`: `flat`
- `date-format`: `YYYY-MM-DD`
- `wiki-link-style`: `title`
- `heading-style`: `atx`

These are suggestions only. Defaults are NEVER used silently.

## Confirmation

Present findings to the user via `AskUserQuestion`. Walk each setting one at a time (or batch related ones — 2–4 per `AskUserQuestion` call is fine).

For each detected value, give the user three options:
- `Confirm` — use what was detected
- `Adjust` — type a different value
- `Skip` — leave field unset (skill will prompt at use time)

For values NOT detected, show defaults as one option and allow the user to adjust or skip.

## Preview and approve

After the user has chosen all values, render the final `.almanac.md` content (YAML frontmatter + body — use the template at `plugins/almanac/templates/almanac-config.md` as the shape). Show the full preview to the user.

Ask via `AskUserQuestion`: `Approve`, `Edit YAML directly`, `Cancel`.

- `Approve` → write the file.
- `Edit YAML directly` → prompt the user to paste replacement YAML. Validate it parses. On parse error, show the error and re-prompt.
- `Cancel` → stop, do not write.

## Commit-safety check

BEFORE writing, scan the rendered content for:
- Any path starting with `/` (absolute path — MUST NOT be present)
- Any path starting with `~` (home reference — MUST NOT be present)
- Any value matching `trigger-id`, `state`, `machine`, `hostname`, `uuid` as a YAML key (MUST NOT be present)
- Any 32+ char hex/base64 blob that isn't a known safe value

If any violation is found, STOP with a clear message naming the offending field. This is non-negotiable — `.almanac.md` must be commit-safe.

## Atomic write

Write to `.almanac.md.tmp` at `cwd`, then `mv -- .almanac.md.tmp .almanac.md`. Never partial writes. Never leave `.tmp` behind.

## Optional vault CLAUDE.md

After `.almanac.md` is written, check whether `CLAUDE.md` exists at `cwd`. If not, prompt once via `AskUserQuestion`:

- `Copy Almanac's starter` — copy `plugins/almanac/templates/vault-CLAUDE.md` to `CLAUDE.md` at the vault root (atomic: write to `.tmp`, then `mv --`).
- `Skip` — do nothing.

If `CLAUDE.md` already exists, do not offer — the user has their own conventions. Never overwrite.

## Output

On success, print:

```
Wrote .almanac.md.
Next: /almanac:reflect --lens learning --date yesterday
      /almanac:investigate "<topic>"
If you want recurring reflect runs: see docs/scheduling.md.
```

## Errors

- Non-vault cwd → stop with the documented message.
- Parse error on user-edited YAML → re-prompt.
- Write failure → delete `.tmp`, stop with the OS error.
- User cancels → stop without writing.

## What init does NOT do

- Does not create folders the user didn't ask for.
- Does not scaffold daily notes, templates, or a Learning folder.
- Does not register cron triggers, scheduling, or state files.
- Does not write anything outside `cwd`.
- Does not reorganize existing notes.
