# Extending lenses

## What a lens is

A lens is a markdown file with YAML frontmatter and a prompt body. `reflect` reads a history summary, renders the lens with variable substitution, and executes the rendered body as instructions. The body produces note content; `scribe` owns frontmatter rendering and writes the file to the configured folder.

Lenses are instructions to the agent. They are not templates for the output. **Body output must be body-only — no `---` frontmatter block.** If a lens emits a frontmatter block, `reflect` strips it before handoff.

## File format

```markdown
---
name: learning
description: Extract what you learned from yesterday's sessions.
title-template: "Learning Review — {{date}}"
tags: [learning, reflection]
---

You are reviewing the history summary below. For each distinct topic
touched, write one paragraph on what was learned. Cite the session ID.

{{history-summary}}

Write the note as markdown under an H1 that matches the title template.
```

Fields:

- `name` (required) — slug used by `--lens NAME`.
- `title-template` (required) — rendered with the variables below; becomes the note filename and H1.
- `description` (optional) — one-line summary shown when the user is prompted to pick a lens.
- `tags` (optional) — YAML list. Passed to `scribe` via `--tags`. If absent, reflect defaults to `reflection,<lens-name>`.

Variable substitution uses `{{name}}` and is literal string replacement on the rendered prompt, not on output.

## Variables

| Variable | Value |
|---|---|
| `{{date}}` | Resolved date window as a human string, e.g. `2026-04-15` or `last 7 days` |
| `{{project}}` | Project name, or `all` if unfiltered |
| `{{lens-name}}` | Name of the current lens |
| `{{history-summary}}` | YAML block from `history --format summary` |

## Precedence

Lens resolution order, highest priority first:

1. `--lens-inline "<body>"` — body supplied on the command line. Used verbatim.
2. `--lens-file <path>` — explicit file path. Path must exist.
3. `--lens NAME` — name resolved via lookup.

For `--lens NAME`:

1. `~/.almanac/lenses/<name>.md` (user)
2. `plugins/almanac/lenses/<name>.md` (built-in)

A user file with the same name as a built-in always wins. There is no merging.

## Worked example — "regret" lens

`~/.almanac/lenses/regret.md`:

```markdown
---
name: regret
description: Decisions from the window that you'd undo if starting fresh.
title-template: "Regret Review — {{date}}"
tags: [regret, reflection]
---

Read the history summary below. Identify 3-5 concrete decisions made
during the window: architectural choices, library picks, refactors,
abandoned approaches, directory layouts, naming.

For each decision, ask: if this were a greenfield project today, with
everything you know after doing the work, would you make the same call?

Write a list. Each item:

- The decision, in one sentence.
- The session ID and approximate time.
- "Keep" or "Undo".
- One-paragraph justification that engages with the strongest counter-
  argument, not a restatement of the original reasoning.

Skip decisions that are genuinely too small to re-litigate. Do not pad.

{{history-summary}}

Output as markdown under an H1 matching the title template. Do not emit a
YAML frontmatter block — `scribe` renders frontmatter from `.almanac.md`.
```

Invoke:

```
/almanac:reflect --lens regret --date yesterday
```

## Tips

- Keep lens prompt bodies under 100 lines. Lenses are instructions, not templates.
- Use `<!-- HTML comments -->` for notes to yourself. They are passed to the agent but ignored by markdown renderers.
- Invoke `WebSearch` from the lens body if you want live citations — the agent will call it.
- Test with `--dry-run` first. It renders the lens and prints the prompt without calling the agent or writing any file.
- Never emit a `---` frontmatter block from a lens body. `scribe` owns frontmatter. Reflect strips any frontmatter block it detects before handoff, but emit body-only to be safe.
