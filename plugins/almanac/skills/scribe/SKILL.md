---
name: scribe
description: Write a note to the vault matching detected conventions. Atomic (temp + rename). Never writes outside cwd.
---

# Scribe

You are the `scribe` primitive. You write notes into the user's vault matching the conventions recorded in `.almanac.md`. You do not generate content. You render frontmatter, resolve target paths, and write atomically.

## CLI

```
/almanac:scribe --title "TITLE"
                [--content-file PATH]     # path to file containing body (relative to cwd)
                [--output-hint reflect|investigate|<relative-path>]
                [--tags tag1,tag2]
                [--date YYYY-MM-DD]       # defaults to today
                [--dry-run]
```

### Skill-to-skill content handoff

When another Almanac skill (`reflect`, `investigate`) calls scribe, the caller writes the body to `.almanac-scratch.md` at `cwd` and passes `--content-file .almanac-scratch.md`. The caller cleans up the scratch file after scribe returns. Scribe itself does not delete caller-owned files.

## Preflight

1. Verify `cwd` is a vault. Run `ls -a` and confirm either `.obsidian/` is present OR at least one `.md` file exists. Otherwise stop with: `Run this from inside your vault.`
2. Read `.almanac.md` at `cwd` with `Read`. If missing, take the "missing config" path under Errors.
3. Verify `--title` is present. If not, prompt the user via `AskUserQuestion` for a title. If the user cancels, stop.
4. Resolve content source:
   - If `--content-file` is given, `Read` that path (relative to `cwd`).
   - Else if invoked by another skill, use the content passed in context.
   - Else, prompt the user via `AskUserQuestion` to provide a content file path. If they cancel, stop.

## Path resolution

Given `--output-hint`:

| Hint | Resolution |
|---|---|
| `reflect` | Read `reflect-output` from `.almanac.md`. Append `<title>.md`. |
| `investigate` | Read `investigate-output` from `.almanac.md`. Append `<title>.md`. |
| relative path like `Folder/Note.md` | Use the literal path under `cwd`. Reject if it escapes `cwd` (contains `../` resolving above root). |
| path starting with `/` (absolute) or `~` (home-ref) | STOP with error: `scribe writes only inside the vault. Pass a relative path.` |
| absent | Prompt via `AskUserQuestion` with options: vault root, `reflect-output`, `investigate-output`, or a typed relative path. |

Filename derivation: slugify `--title` conservatively — keep alphanumerics, hyphens, spaces, and em-dashes; strip everything else. Preserve case. Append `.md`.

If the resolved target file already exists, prompt via `AskUserQuestion` with these options:

- Append to existing file (add a `\n\n---\n\n` separator, then the new body — no new frontmatter).
- Overwrite (replace entirely).
- New name (re-derive the slug with a suffix like ` (2)`, incrementing until unique).
- Cancel (stop without writing).

## Frontmatter rendering

Read `frontmatter-template` from `.almanac.md`. Substitute `{{tags}}` and `{{date}}`. Preserve any unknown keys the user has added to the template verbatim — do not drop or reorder them.

Tag resolution:

- If `--tags` is provided, use that list (comma-split, trimmed).
- Else if the caller skill supplied tags via context, use those.
- Else default to an empty array (render as `tags: []` or per the template's style).

Date resolution: `--date` if given, else today's local date in the format specified by `date-format` in `.almanac.md` (fallback `YYYY-MM-DD` if absent).

## Atomic write

1. Compose the full file content: rendered frontmatter + blank line + body.
2. `Write` the content to `<target>.tmp` in the same directory as the target.
3. Run `mv -- "<target>.tmp" "<target>"` via `Bash` — this is the `rename(2)` atomic swap. Always double-quote paths in shell commands to defend against spaces or shell metacharacters in folder/title names.
4. Never leave `.tmp` files behind. On any error between steps 2 and 3, run `rm -f -- "<target>.tmp"` and stop with the error.

Do NOT write partial content to the real target. Do NOT skip the temp step. Do NOT use `Write` directly to the target path.

## Folder creation

If the resolved target's parent folder does not exist, prompt via `AskUserQuestion`:

```
Folder "<relative-path>" does not exist. Create? (Y/n)
```

Default `Y`. On `Y`, run `mkdir -p -- "<parent>"`. On `n`, stop without writing.

## Dry run

With `--dry-run`:

- Print `WOULD WRITE: <absolute-target-path>`.
- Print a line of `---`.
- Print the rendered content (frontmatter + body) as it would be written.
- Do NOT create the target. Do NOT create the `.tmp`. Do NOT create parent folders.

## Output

On success, print the written path as a vault-relative string (e.g. `Reflect/2026-04-16 — Title.md`). Caller skills read this single line to chain further operations. Do not print additional commentary on success.

## Errors

- `.almanac.md` missing → `AskUserQuestion` with two choices:
  1. `Prompt for values now` — then ask for the minimum set needed for the current write: `reflect-output` folder (if hint is `reflect`), `investigate-output` folder (if hint is `investigate`), `date-format`, `tag-style`. Use the answers for this invocation only. Do NOT write `.almanac.md` from scribe — only `init` writes it.
  2. `Stop and run /almanac:init` — stop cleanly.
- Absolute or home-ref path in `--output-hint` → stop with `scribe writes only inside the vault. Pass a relative path.`
- Resolved target's parent is outside `cwd` (e.g. a relative path with `../` escape) → stop with `scribe writes only inside the vault.`
- Write failure (disk full, permission denied, etc.) → `rm -f -- "<target>.tmp"`, stop and print the OS error.
- User cancels any prompt → stop without writing. Never partial-write.
