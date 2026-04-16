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

## Two lens modes

A lens can prescribe either a **voice/sensibility** or a **specific output structure**. Pick based on what the note is for.

- **Voice-prescribed** — for notes the user reads again later: reflection on sessions, research on a topic. The lens describes the desired voice and forbids template fingerprints (section headers like `## Concepts`, bolded label-prefixes, footnote-style citations, tidy closing summaries). See `lenses/learning.md`, `lenses/pain-points.md`, and `skills/investigate/SKILL.md` as exemplars.
- **Structure-prescribed** — for operational reports where scannability is the point: build-lists, metrics dashboards, candidate slates. The lens specifies exact sections and field shapes. See `lenses/skill-candidates.md` and `lenses/workflow.md` as exemplars.

### A critical voice note for voice-prescribed lenses

There are three voices a voice-prescribed lens can reasonably ask for. Pick one deliberately — mixing them, or defaulting to the wrong one, produces uncanny output:

1. **Second-person observational** — for notes about the user's sessions or decisions. "You kept hitting X," "this came up while you were working on Y." The narrator is an attentive observer writing FOR the user. `learning` and `pain-points` use this mode. **Never let the model slip into first-person-as-the-user here** — "I kept hitting X" read in the user's own vault is ventriloquism and lands badly.
2. **Direct reference voice** — for notes about a topic, not about the user. "`[LibraryImport]` is a source generator that...", "Prefer X when Y." No "I," no "you." `investigate` uses this mode. It matches how a senior engineer writes an internal reference doc.
3. **First-person as the user** — only ever appropriate if the user is supplying their own transcript/dictation that the lens is just cleaning up. Almost never the right choice for a lens that generates content from history summaries. **Do not prescribe this voice** unless you know exactly why.

The forbidden-fingerprints list in a voice-prescribed lens should always include a clause rejecting the wrong first-person / second-person mode — not just the obvious template headers. See `lenses/pain-points.md` for the explicit shape.

## Worked example — "regret" lens (voice-prescribed, observational)

`~/.almanac/lenses/regret.md`:

```markdown
---
name: regret
description: Observational note about decisions from the window that are worth revisiting.
title-template: "Regret Review — {{date}}"
tags: [regret, reflection]
---

Read the history summary below. Find 3–5 concrete decisions made during
the window — architectural choices, library picks, refactors, abandoned
approaches, directory layouts, naming. Skip decisions too small to
re-litigate. Do not pad.

For each one, ask the real question: if the work were starting fresh
today, knowing what the sessions now show, would the same call hold?
Don't restate the original reasoning. Engage the strongest counter-
argument honestly.

Write this as a second-person observational note — the voice of an
attentive colleague describing what happened and whether each decision
would hold up in retrospect. "You picked X over Y on Tuesday; the
strongest counter-argument is Z, and in this case it does/doesn't hold
because..." Narrate from outside the user's head. Do NOT write in first
person as the user ("I picked X," "I should have"). Tie each decision
back to the specific session it came up in (session ID inline, as prose,
not as a labeled field).

Forbidden — template AND impersonation fingerprints:

- A "Keep / Undo" column or bolded labels
- Section headers like `## Decisions` or `## Verdict`
- A numbered list of decisions with one-sentence summaries
- First-person narration as the user: "I picked," "I should have," "I'd undo"
- A tidy closing summary

Length matches the material — a week with one decision that genuinely
warrants re-examination is allowed to be 800 words on that one decision
alone.

{{history-summary}}

Output as markdown under an H1 matching the title template. Do not emit
a YAML frontmatter block — `scribe` renders frontmatter from `.almanac.md`.
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
