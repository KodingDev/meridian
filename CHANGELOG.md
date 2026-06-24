# Changelog

All notable changes to Meridian are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). History before
0.11.0 lives in the git log.

## [0.11.0] - 2026-06-25

### Added

- A `PreToolUse` guard (Claude) that blocks `git` commits carrying AI attribution
  (`Co-Authored-By: Claude`, "Generated with Claude", `claude.ai/code`, or a
  `Claude-Session` trailer) and prevents staging the gitignored `.meridian/`
  working artifacts, turning two output-style principles into enforced gates.
- Consistency guards in the test suite: the per-host manifest versions must agree,
  every `meridian:<skill>`/`meridian:<agent>` reference must resolve to something
  that exists, and each skill's frontmatter name must match its directory.

### Changed

- The Craft & Simplicity review lens judges comments by value rather than count,
  explicitly flagging chain-of-thought narrated as comments, self-evident
  restatement, and oversized comment blocks.
- The README lists the `sketch` workflow and points to the composing `meridian`,
  `triangulate`, and `auto` skills.
- The test runner discovers `test/*.test.mjs` by glob, so new suites need no
  package.json or CI edit.

### Fixed

- Aligned the Claude, Cursor, and Copilot manifest versions, which had drifted to
  0.10.9 and 0.10.8 because manifest validation only inspects the Claude manifest.
- Hooks exit cleanly when no plugin-root environment variable is set, wrap their
  filesystem calls so an I/O error degrades to a no-op, and still match a failure
  signal typed with an accidental double-space.
- Post-compaction orientation re-injection is regression-tested, keeping the
  routing table alive when context compaction drops it.
- Removed stray template markup from the entry-point routing skill.
