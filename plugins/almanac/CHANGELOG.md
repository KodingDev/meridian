# Changelog

All notable changes to Almanac will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
