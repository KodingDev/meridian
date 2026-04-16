---
name: history
description: Query ~/.claude/projects/*.jsonl with filters and intent queries. Returns summary YAML, parsed JSONL, or raw lines.
---

# History

You are the `history` primitive. You filter and serialize Claude Code session logs from `~/.claude/projects/`. You do not interpret, summarize, or narrate — you produce deterministic structured output the caller can consume.

## CLI

```
/almanac:history [--date yesterday|today|YYYY-MM-DD|last-N-days]
                 [--since ISO-8601] [--until ISO-8601]
                 [--project NAME|PATH|all]    # comma-separated, any-of match
                 [--tools read,edit,write,bash,other]  # any-of
                 [--query "natural-language intent"]
                 [--grep REGEX]
                 [--format summary|jsonl|raw]
```

Defaults: `--date today`, `--project all`, `--format summary`.

## Preflight

1. Verify `cwd` is a vault. Run `ls -a` and confirm either `.obsidian/` is present OR at least one `.md` file exists. Otherwise stop with: `Run this from inside your vault.`
2. `Read` `.almanac.md` at `cwd` if present. `history` does not require any field from it — this read is informational only (keeps per-skill behaviour consistent). If missing, continue without prompting; history has no output folders to resolve.
3. Verify `~/.claude/projects/` exists. If not, stop with: `Expected ~/.claude/projects/ — is Claude Code installed? No sessions to read.` Fail loud.
4. Parse flags. If both `--since`/`--until` and `--date` are given, `--since`/`--until` win. `--query` and `--grep` may coexist; both must match for a session to survive. `all` in `--project` is a reserved literal.

## Source format

Sessions live at `~/.claude/projects/<encoded-cwd>/<session-uuid>.jsonl`. The `<encoded-cwd>` is the session's original cwd with `/` replaced by `-` (e.g. `/Users/me/code` becomes `-Users-me-code`). One JSON event per line.

## Project resolution

If `--project all`: enumerate every encoded dir under `~/.claude/projects/`.

Else: for each comma-separated value in `--project`, substring-match against encoded dir names in-memory. **Never interpolate user input into a shell glob or `find` pattern.** Enumerate with `Glob` (`~/.claude/projects/*`) or `ls ~/.claude/projects/` (no user value in the command), then filter the returned list via string `includes()`. Combine matches (union).

- If a single value matches multiple dirs ambiguously, use `AskUserQuestion` with the candidate list to let the user pick.
- If a value matches nothing, stop. List the available project names (decoded back to `/`-paths for readability) and exit.

## Filter order

Apply filters in this order for efficiency:

1. Date window — on file mtime first (cheap), then refine with event timestamps if needed.
2. Project — already narrowed by directory enumeration above.
3. Tools — a session matches if any event in the session used any listed tool.
4. Grep — literal regex over user/assistant message text.
5. Query — last, because expensive. Read the candidate sessions' summaries and snippets and classify each as relevant/irrelevant to the intent using your own reasoning. No embeddings, no index.

## Parsing

Use `jq` for event-level filters:

```
jq -c 'select(.type=="user" or .type=="assistant" or .type=="tool_call")' -- "<file>"
```

**Shell-injection hardening.** Pass user-supplied values to `jq` via `--arg` only. Never interpolate `--grep REGEX` or `--project NAME` into the jq source string. Example for grep:

```
jq -c --arg re "$USER_REGEX" 'select(.type=="user" or .type=="assistant") | select((.text // "") | test($re))' -- "<file>"
```

Always double-quote file paths (`"<file>"`) in shell commands to defend against spaces or metacharacters. Wrap in a pipeline that tolerates malformed lines (e.g. `jq -c '...' -- "<file>" 2>/dev/null`). Count skipped/malformed lines and include the count in `totals.warnings`.

For small sets (<100 lines), `Read` + per-line JSON parse is acceptable.

The `--query` filter runs in-agent (semantic). No shell exposure there.

## Event schema (jsonl output)

Per session, emit one object:

```yaml
session_id: <uuid>
project_encoded: "-Users-..."
project_decoded: "/Users/..."
started_at: ISO-8601
ended_at: ISO-8601
duration_min: int
messages:
  user: int
  assistant: int
tool_calls:
  read: int
  edit: int
  write: int
  bash: int
  other: int
files_touched: [path, ...]
bash_commands: [cmd, ...]   # env vars stripped
snippets:
  - role: user|assistant
    text: string          # max 500 chars
    timestamp: ISO-8601
```

Snippet selection: always include the first user message. Then include up to 10 more snippets: those matching `--grep` or adjacent to tool-call boundaries. Cap 11 snippets per session. Truncate each `text` to 500 chars.

## Summary schema (default)

```yaml
range:
  since: ISO-8601          # resolved window start in local time
  until: ISO-8601          # resolved window end in local time
filters:
  date: <string|null>      # verbatim flag value, null if not given
  since: <string|null>
  until: <string|null>
  project: <string>        # verbatim, e.g. "all" or "meridian,almanac"
  tools: <string|null>
  query: <string|null>
  grep: <string|null>
  format: summary
totals:
  sessions: int
  duration_min: int
  projects: [decoded-path, ...]   # deduped, uses project_decoded values
  files_touched: int
  warnings: int
sessions:
  - <Event as above>
```

`filters` keys are fixed. Every run with the same flags emits the same `filters` shape. `totals.projects` always uses decoded paths (e.g. `/Users/me/code`), not encoded dir names.

## Raw format

Emit the original JSONL lines untouched, one per post-filter event.

BEFORE printing, warn the user via `AskUserQuestion` with this canonical string (mirrored in `docs/privacy.md` — keep them in sync):

```
WARNING: --format raw emits unredacted session transcripts. Output may contain API keys, tokens, email addresses, file contents, and bash command output. Continue?
```

Options: `Print raw output` / `Cancel`. If the user cancels, stop. Do not print anything.

## Sanitization (bash_commands)

Strip `KEY=value` env-var prefixes from recorded bash commands before including them. Do not include stderr/stdout — only the command string itself. Example: `FOO=bar BAZ=qux ls -la` becomes `ls -la`.

## Errors

- Missing `~/.claude/projects/` → stop with the pointer message above.
- No sessions in window → emit an empty summary (zero sessions, `totals.sessions: 0`). This is not an error.
- Malformed JSONL lines → skip them, increment `totals.warnings`.
- Invalid `--date` value → stop and print the accepted shapes: `yesterday | today | YYYY-MM-DD | last-N-days`.
- Ambiguous `--project` value → `AskUserQuestion` with candidates.
- No matching `--project` → stop with the available list.

## Output

Print the result to stdout in the requested format.

- `summary` and `jsonl` are deterministic — same inputs, same bytes out.
- `raw` requires the pre-print warning above; only emit lines after an explicit user yes.
