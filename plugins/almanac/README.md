# Almanac

Claude Code plugin for the notebook-bound knowledge worker. Session-history reflection and confrontational research, written straight into your Obsidian vault.

## Why

People using AI heavily ship a lot of code without writing every line. You can review diffs. You can't easily see:

- Patterns and libraries you adopted without fully understanding them
- Friction points in your own tooling — including other Claude skills and plugins
- Conversation threads that might seed new skills or workflow improvements
- Whether the "best practice" Claude applied is genuinely the best, or just the loudest

Almanac surfaces these threads and makes them actionable. The user picks the lens; Almanac provides the paper. It does not teach, it does not impose conventions, and it never writes outside the vault.

## Philosophy

- **Detect, don't dictate.** Match the existing vault's conventions. Ask once, remember, allow override.
- **Data before opinion.** Primitives (`history`, `scribe`) return structured data with no editorial layer. Opinions live in lenses — user-editable markdown files.
- **Research is confrontational.** `investigate` does not parrot consensus. It surfaces dissent, shows schools of thought, asks "in what situation does this apply — and not?"
- **The user is the intelligence.** Almanac is scaffolding.

See [docs/philosophy.md](docs/philosophy.md) for the longer version.

## Skills

| Skill | Does |
|-------|------|
| `almanac` | Router — explains the plugin and points at the right skill |
| `history` | Query `~/.claude/projects/*.jsonl` with filters and intent queries |
| `scribe` | Write a note into the vault matching detected conventions |
| `reflect` | Retrospective through a user-chosen lens (learning, pain-points, skill-candidates, workflow, or your own) |
| `investigate` | Deep research on a topic, surfacing dissent and situational decisions |
| `init` | Scan the vault, confirm conventions, write `.almanac.md` |

## Install

```
/plugin marketplace add KodingDev/meridian
/plugin install almanac@meridian
```

## Quick start

```
cd /path/to/your/obsidian/vault
/almanac:init                               # detect vault conventions
/almanac:reflect --lens learning            # review yesterday's sessions
/almanac:investigate "when to use X vs Y"   # confrontational research note
```

## Commit safety

`.almanac.md` is designed to be committed. It contains only vault-relative paths and user-chosen conventions — no absolute paths, no machine IDs, no tokens. Almanac does not write anything outside your vault (no files in `~/.almanac/`, no caches, no scheduling registry).

## Writing your own lens

Lenses are plain markdown files. Drop one at `~/.almanac/lenses/<name>.md` and invoke with `/almanac:reflect --lens <name>`. User lenses shadow built-ins of the same name.

See [docs/extending-lenses.md](docs/extending-lenses.md).

## Optional vault `CLAUDE.md`

Almanac ships a starter at [templates/vault-CLAUDE.md](templates/vault-CLAUDE.md) that tells Claude how to behave inside a vault (wiki-links, daily notes, no HTML). `/almanac:init` offers to copy it to `CLAUDE.md` at the vault root if one doesn't exist; you can also copy it by hand. Skip it entirely if your vault already has conventions documented.

## Scheduling

Not Almanac's job. If you want `reflect` to run daily, use launchd, systemd timers, Task Scheduler, GitHub Actions, or any Claude Code scheduler your setup provides — whatever fits. Worked examples in [docs/scheduling.md](docs/scheduling.md).

## Privacy

Session transcripts may contain secrets. Almanac redacts common patterns (API keys, tokens, emails) before writing reflected notes, never sends raw transcript text to web searches, and warns before printing raw session content. See [docs/privacy.md](docs/privacy.md).

## License

MIT
