---
name: reflect
description: Retrospective through a user-chosen lens. Runs history, applies lens, writes note via scribe.
---

# Reflect

You are the `reflect` workflow. You compose `history` and `scribe` around a user-chosen lens. You apply no opinions of your own — the lens holds the opinions.

## CLI

```
/almanac:reflect [--lens NAME | --lens-file PATH | --lens-inline "PROMPT"]
                 [--date yesterday|today|YYYY-MM-DD|last-N-days]
                 [--since ISO-8601] [--until ISO-8601]
                 [--project NAME|all]
                 [--grep REGEX]
                 [--tools read,edit,write,bash,other]
                 [--dry-run]
```

Lens flags are disjoint — exactly one may be supplied. If none, prompt via `AskUserQuestion` with the available built-ins (`learning`, `pain-points`, `skill-candidates`, `workflow`) and any user lenses found at `~/.almanac/lenses/*.md`.

## Preflight

1. Verify `cwd` is a vault. Check for `.obsidian/` OR any `.md` at the root. Else stop.
2. Read `.almanac.md`. If missing, prompt the user with two options: `Run /almanac:init first` / `Prompt for needed values now`. If prompt-now, ask for `reflect-output` folder at minimum. Never silently default.
3. Validate lens flags: at most one of `--lens`, `--lens-file`, `--lens-inline` may be supplied. If more than one, stop with: `Pick one.`
4. If none of the lens flags were supplied, prompt via `AskUserQuestion` for a lens. Enumerate built-ins and any `~/.almanac/lenses/*.md` via `Glob`.

## Lens resolution

| Flag | Resolution |
|---|---|
| `--lens NAME` | First check `~/.almanac/lenses/<NAME>.md`. If present, use it (user shadows built-in). Else use the plugin's `lenses/<NAME>.md`. If neither, stop with: `No lens named <NAME>. Available: <list>.` |
| `--lens-file PATH` | `Read` the literal path. Must exist. |
| `--lens-inline "PROMPT"` | Construct a synthetic lens in-memory with the prompt as the body, minimal frontmatter (`name: inline`, `title-template: "Reflection — {{date}}"`, `tags: [reflection]`). |

Parse the lens's YAML frontmatter. Required keys: `name`, `title-template`. Optional: `tags`, `description`. Missing required keys → stop with a message naming the key.

## History call

Invoke history logic with the user's date/project/grep/tools filters and `--format summary`. Read the sibling `skills/history/SKILL.md` if you need the precise filter semantics.

Capture the YAML summary in a variable. You will substitute it into the lens body as `{{history-summary}}`.

## Lens rendering

Substitute variables in the lens body:
- `{{date}}` — human-readable resolved window (e.g. `2026-04-15` or `last 7 days`)
- `{{project}}` — the `--project` value, or `all` if unset
- `{{lens-name}}` — the lens's `name` frontmatter field
- `{{history-summary}}` — the YAML block captured from history

Render `title-template` with the same variables to produce the note title.

## Lens execution

Execute the rendered prompt body as if it were your own instructions. Follow it literally. If the lens instructs you to run `WebSearch`, do so.

Lenses prescribe one of two output modes:

- **Voice-prescribed** (e.g. `learning`, `pain-points`) — the lens describes a sensibility and forbids template fingerprints. Write to that voice. Do not add headings, lists, or labels the lens did not ask for. Do not retreat into a familiar template shape just because the lens didn't give you one.
- **Structure-prescribed** (e.g. `skill-candidates`, `workflow`) — the lens specifies sections and field shapes. Produce exactly those sections, in that shape.

The lens body MUST produce body content only — no YAML frontmatter blocks. `scribe` owns frontmatter rendering. If a lens emits a `---` block, strip it before handoff.

Do NOT soften challenging prompts. The lens is contracted output.

## Redaction

Before writing, scrub the generated body:

- Strip API keys and tokens:
  - `sk-(ant-)?[A-Za-z0-9_-]{20,}` (OpenAI / Anthropic)
  - `ghp_[A-Za-z0-9]{30,}`, `gho_[A-Za-z0-9]{30,}`, `ghs_[A-Za-z0-9]{30,}` (GitHub)
  - `xox[abpors]-[A-Za-z0-9-]{10,}` (Slack)
  - `AKIA[0-9A-Z]{16}` (AWS access key)
  - JWTs: `eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}`
  - Generic 32+ char hex/base64 blocks adjacent to words like `key`, `token`, `secret`, `password`, `bearer`
- Strip email addresses (`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
- Strip absolute file paths that point outside the current vault (keep vault-relative paths)

Redaction is conservative. If a match is ambiguous, redact. The canonical list lives here and in `docs/privacy.md` — keep them in sync when you change one.

## Scribe call

Content handoff: reflect writes the redacted body to `.almanac-scratch.md` at `cwd`, invokes scribe with `--content-file .almanac-scratch.md`, then `rm -f .almanac-scratch.md` after scribe returns.

Scribe invocation:

- `--title`: rendered `title-template`
- `--content-file .almanac-scratch.md`
- `--output-hint reflect` — resolves to `reflect-output` folder from `.almanac.md`
- `--tags`: the lens's `tags` frontmatter field joined with comma. If absent, default to `reflection,<lens-name>`.
- `--date`: the resolved date

Read the sibling `skills/scribe/SKILL.md` for the precise scribe interface.

## Dry run

With `--dry-run`, do NOT write `.almanac-scratch.md` and do NOT call scribe. Print the resolved target path (derived from `.almanac.md :: reflect-output` + title) followed by `---` and the full redacted body.

## Output

On success, print the vault-relative path of the written note.

## Errors

- Multiple lens flags → stop, state "Pick one."
- Lens file missing → stop with available lenses listed.
- Lens YAML malformed → stop, name the parse error.
- Empty history summary (no sessions in window) → write the note anyway; the lens may have something to say about an empty window, or the output will be brief. Do not fabricate sessions.
- WebSearch unavailable (if the lens uses it) → the lens itself handles this; `reflect` does not force a fallback.
