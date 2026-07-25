# Changelog

All notable changes to Meridian are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). History before
0.11.0 lives in the git log.

## [0.13.0] - 2026-07-25

### Added

- `commit` carries pull request description guidance: lead with rationale, describe behavior rather than the diff, state the feedback wanted, report what was actually verified, flag breaking changes and migrations, and scale the description to the change.
- Both commit messages and pull request descriptions are governed by an explicit rule that they describe the resulting code, never the session that produced it, with the circumstantial detail to omit enumerated.
- Specs and sketches carry a `Status` line through `DRAFT`, `APPROVED`, `IN PROGRESS`, `SHIPPED <sha>`, and `SUPERSEDED BY <file>`. `execute` moves it as implementation proceeds.

### Changed

- Model profiles are named for families and matched by prefix, so a later release in a mapped family keeps its corrections instead of dropping to the baseline. Matching is a plain prefix over the identifier the host reports, so vendor- or region-qualified identifiers (for example the `us.anthropic.` Bedrock form) still fall through to the baseline.
- **Breaking:** the `opus-4.8` profile is renamed `claude-opus`. A host-local `<state-base>/meridian/config.json` setting `"fallbackProfile": "opus-4.8"` no longer resolves and silently yields the baseline standard with no adapters. Rename the value to `claude-opus`.
- `claude-fable-` now resolves to the `fable` profile, which carries no adapters by design. A Fable session therefore no longer picks up a configured `fallbackProfile`.
- `commit` is model-invocable. Its conventions are reachable whenever a commit message or pull request description is written, including by other skills. Reaching them authorizes nothing: committing, pushing, and opening or editing a pull request sit behind a hard gate and each still require an explicit request.
- `execute` and `auto` point at `meridian:commit` for message conventions instead of restating them, and no longer describe the commit flow as un-reachable.
- Eval scenarios cover the new boundary: authoring a commit message or pull request description reaches `commit`, while reading history and an implied-approval prompt do not.

### Fixed

- Adapter resolution no longer depends on a single exact model identifier, which left every unlisted model on the baseline standard with no corrections applied.

## [0.12.0] - 2026-07-13

### Added

- A model-independent professional engineering standard and atomic model adapters selected from named profiles at session start.
- Manual-invocation policy for formal flows across Claude Code, Cursor, Copilot, and Codex skill metadata.
- Optional project-instruction sections for customer security, compliance, verification, deployment, rollback, artifacts, and allowed environments.

### Changed

- Formal `brainstorm`, `sketch`, `execute`, `review`, `commit`, `document`, and `auto` flows are user-owned. They no longer invoke one another automatically or repeat approval already granted by invocation.
- `debug`, `research`, `triangulate`, `delegate`, and `respond` are narrow model-invoked disciplines with risk-proportionate process.
- `execute` performs proportionate verification but no longer launches formal review or commit flows.
- Formal review enumerates tracked and untracked working-tree changes before dispatching independent lenses.
- Interactive flows use structured question tools when available and fall back to plain text on hosts without them.

### Removed

- The forced Meridian output style, automatic workflow routing table, periodic routing audit, terse-failure reroute, and their session state machinery.

## [0.11.3] - 2026-07-06

### Added

- The output style grounds claims in the project's own artifacts, not just external docs:
  read the existing code, spec, and canonical data before writing competing logic; cite
  real measurements (settled invoices, logs, profiles) for cost/performance/architecture
  decisions. A new operational-discipline section prefers a reusable script over repeated
  one-off tool calls and reads state at its source instead of polling.
- The output style's voice rules add a calibrated-reporting register: once verification
  is exhausted, remaining conclusions are presented as bets — observed facts separated
  from inferences, confidence and blind spots named, each bet carrying what would prove
  it wrong.
- `auto` gains autonomy stamina: the horizon for stepped-away work is honest readiness
  ("I'm ready for you"), not elapsed time; before ending a turn, remaining verifiable
  work means the turn is not over. Blockers must be earned — try another angle, dig
  deeper, or dispatch a subagent before declaring one; a genuine fork is a decision only
  the human can make (taste, money, irreversibility).
- `debug` requires instrumenting the real code path — logging added to the actual
  executable run with real data, never one-off probe scripts or simulations — and holds
  fixes to a root-cause bar: a fix must explain why the bug existed, or it is a
  workaround, not a fix.
- `review`'s craft lens flags symptom patches: a guard, carve-out, or special case that
  narrows a visible failure while the underlying cause remains, even when the diff
  improves behavior.
- `execute` verification exercises the real flow with real data where a runtime surface
  exists, not synthetic probes.
- `brainstorm` re-reads the user's provided material (request, plan, handoff, spec) in
  full before asking any clarifying question.
- `delegate`'s model selection names the expensive failure — a wide fan-out at flagship
  pricing doing mechanical work a small model does identically — and requires the
  orchestrator to read the final synthesis itself: the conclusion is not delegable.

### Changed

- `respond` no longer treats user feedback as trusted-implement-after-understanding:
  the user is trusted on intent and priorities, but suggestions are evaluated on
  technical merits like anyone's, per the Challenge Protocol.
- The session orientation is the single routing authority. It absorbs the one line the
  router skill carried that it lacked (visual regressions are bugs even when they
  appeared one step ago in the same session) and closes with a statement of authority
  instead of a pointer to the router skill.

### Removed

- The `meridian` router skill. Its content was a near-verbatim copy of the session
  orientation, which is injected every session — so the "invoke for the full routing
  reference" pointer never fired, and the two copies had already drifted in wording.
  Skills that referenced "the meridian router" now reference the orientation's routing
  table.
- The `## Integration` footers (Predecessors / Successors / May invoke) on every skill.
  Routing is owned by the orientation, and each skill's body already names the skills it
  invokes inline; the footers changed no behavior.
- `research`'s "HARD-GATE Rationale (Dual-Location Enforcement)" section — a maintainer
  note, not an instruction to the model. The constraint it recorded still holds: the
  skill's gate and the `meridian:research` agent's gate are duplicated intentionally
  (caller contract vs. operative rule) and their wordings must stay aligned.

## [0.11.2] - 2026-07-03

### Added

- Codex host support, alongside the existing Claude Code, Cursor, and Copilot hosts.
  `detectHost` recognizes Codex by the un-prefixed `PLUGIN_ROOT` it sets — Claude sets only
  `CLAUDE_PLUGIN_ROOT`, which Codex also sets as a compat alias — and routes Codex session
  state to `CODEX_HOME` (default `~/.codex`). Codex loads the plugin's default
  `hooks/hooks.json` and shares Claude's `hookSpecificOutput` contract, so orientation and
  the periodic routing audit inject on `SessionStart` and `UserPromptSubmit`, and the
  commit-attribution `PreToolUse` guard applies.

### Fixed

- Copilot's `research` and `triangulate` subagents keep web access: their `tools` arrays add
  Copilot's `web_fetch` tool, which — unlike `Read`/`Grep`/`Glob`/`Bash`, whose Claude names
  Copilot resolves as aliases — has no Claude-name alias, so `WebFetch`/`WebSearch` alone
  resolved to nothing and left those agents with no web tool.

## [0.11.1] - 2026-06-29

### Changed

- The `commit` skill governs PR descriptions alongside commit messages: a shared
  message-discipline rule set requires matching the repo's established PR pattern
  (validated against real PRs via `gh` where possible), using the repository's PR
  template when one exists, preferring brevity, choosing the commit scope
  deliberately rather than by reflex, describing the change as it is rather than
  the implementation journey, and dropping "used to be X, now Y" framing. The
  subagent rules carry the same discipline.
- The asking-questions principle gains a fallback for hosts without `AskUserQuestion`
  (Cursor, Copilot): ask the same question in plain text and wait rather than assuming a
  default. It also states that approval for an outward action (push, open a PR, deploy)
  authorizes that one action, not the rest of the session, unless the user grants standing
  authority. Both reach non-Claude hosts through the session-orientation context.

## [0.11.0] - 2026-06-25

### Added

- A `PreToolUse` guard (Claude) that blocks `git` commits carrying AI attribution
  (`Co-Authored-By: Claude`, "Generated with Claude", `claude.ai/code`, or a
  `Claude-Session` trailer) and prevents staging the gitignored `.meridian/`
  working artifacts, turning two output-style principles into enforced gates.
- Consistency guards in the test suite: the per-host manifest versions must agree,
  every `meridian:<skill>`/`meridian:<agent>` reference must resolve to something
  that exists, and each skill's frontmatter name must match its directory.
- A skill-routing eval harness (`eval/`, promptfoo + the `anthropic:claude-agent-sdk`
  provider) that checks prompts route to the correct skill against the real plugin on
  Sonnet. On-demand dev tooling (`pnpm eval`); not part of the offline CI gates.

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
