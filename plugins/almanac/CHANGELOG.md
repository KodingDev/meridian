# Changelog

All notable changes to Almanac will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-04-17

### Changed — voice over structure for vault-bound output
- `investigate` and the `learning` and `pain-points` lenses now prescribe **voice** instead of structure. All three drop the prior templated-essay shape (`## Schools of thought` / `## Concepts to own` / `## Friction points observed` / `## Sources` blocks) and instead describe the desired voice and forbid template fingerprints.
- Each of the three prompts uses a **different voice** chosen for what the note is actually for:
  - `investigate` → **direct reference voice**, like a senior engineer writing an internal working reference. No "I," no "you." Topic-organic sections, inline markdown-link citations, decision cheatsheets where the topic warrants them. Emulates the `C# Native Interop.md`-style reference doc the user asked us to match.
  - `learning` → **second-person observational** for the session tie-back ("this came up on Tuesday while you were refactoring X") + **direct reference voice** for the concept itself.
  - `pain-points` → **second-person observational** throughout ("you kept hitting X," "the thing that wore you down was Y"). Written FOR the user by an attentive observer, not AS them.
- All three prompts explicitly forbid first-person narration as if the model were the user ("I kept hitting," "I should have pushed back," "I want to remember"). An earlier iteration of this release shipped with that first-person framing and produced uncanny output that read as the model ventriloquizing the user in their own vault.
- All three also forbid the prior template artifacts: section headers listed above, bolded label-prefixes (`**Proponents:**`, `**Applies when:**`, `**Severity:**`, `**Session:**`), bracketed source-type tags (`[canonical]`, `[dissent]`), footnote-style citations (`[1]`, `[3, 5]`), tidy closing summaries.
- Integrity rules unchanged: ≥3 canonical + ≥1 dissent for `investigate`, 2–3 canonical + 1 dissent per concept for `learning`, every `pain-points` claim grounded in a real history-summary signal.
- `skill-candidates` and `workflow` lenses are unchanged on purpose — they're operational reports (build-lists and metrics dashboards), not reflective notes, and scannable structure is the point.

### Changed — supporting copy
- `templates/vault-CLAUDE.md` writing-style section rewritten to describe three voices — **reference** (direct, authoritative; includes `investigate` output), **reflection about the user's sessions** (second-person observational; Almanac `reflect` output), and **personal daily notes** (the user's own, not Claude's to write). The prior "direct prose / short paragraphs" single-mode guidance was actively contradicting the reflection voice.
- `skills/reflect/SKILL.md` lens-execution rules now distinguish voice-prescribed lenses (don't add headings the lens didn't ask for) from structure-prescribed lenses (produce exact sections), so the orchestrator handles both modes correctly.
- `docs/extending-lenses.md` rewritten with a "Two lens modes" section AND a critical voice-selection note explaining when to pick second-person-observational vs reference vs first-person-as-user. The worked `regret` example was rewritten in second-person observational voice to stop teaching impersonation to users writing custom lenses.
- `docs/philosophy.md` and `README.md` "Research is confrontational" sections now describe `investigate` as a direct working reference rather than a journal entry, dropping both the "schools of thought" framing (now a forbidden section header) and the earlier misstep of describing investigate output as first-person.

## [0.1.0] — 2026-04-16

### Added
- Initial release.
- `almanac` router skill.
- `history` primitive — query `~/.claude/projects/*.jsonl` with `--date`, `--since`, `--until`, `--project`, `--query` (semantic), `--grep` (literal), `--tools`, `--format summary|jsonl|raw`.
- `scribe` primitive — write a note to the vault matching detected conventions; atomic (temp + rename).
- `reflect` workflow — retrospective through a user-chosen lens, composes `history` + `scribe`.
- `investigate` workflow — confrontational research note with schools of thought, dissent, situational decision frames.
- `init` skill — detect vault conventions, confirm, write `.almanac.md`.
- Four built-in lenses: `learning`, `pain-points`, `skill-candidates`, `workflow`.
- Templates: `vault-CLAUDE.md`, `almanac-config.md`.
- Docs: `philosophy`, `extending-lenses`, `history-schema`, `privacy`, `scheduling`.
