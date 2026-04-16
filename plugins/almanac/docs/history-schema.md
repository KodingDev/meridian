# History schema

## Source

Claude Code writes session transcripts to `~/.claude/projects/<encoded-path>/*.jsonl`. The encoded path is the project's `cwd` with `/` replaced by `-`.

Example: cwd `/Users/kodingdev/Resilio Sync/Grand Central` encodes to `-Users-kodingdev-Resilio-Sync-Grand-Central`.

`history` enumerates `~/.claude/projects/` at runtime and substring-matches user-supplied project names against encoded directory names. Ambiguous matches prompt the user to disambiguate; exact matches run without prompting.

No index is built. Directory enumeration happens per invocation.

## Event schema

Each session produces one event in the following shape:

```yaml
session_id: <uuid>
project_encoded: "-Users-kodingdev-Resilio-Sync-..."
project_decoded: "/Users/kodingdev/Resilio Sync/..."
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
files_touched: [path, ...]         # deduped, ordered by first occurrence
bash_commands: [cmd, ...]           # command strings, sanitized (no env)
snippets:
  - role: user | assistant
    text: string                    # truncated to 500 chars per snippet
    timestamp: ISO-8601
```

Snippet selection: the first user message, plus up to 10 additional messages that match `--grep` or sit at tool-call boundaries. Maximum 11 snippets per session. Snippets are truncated at 500 characters each; truncation is marked with a trailing `…`.

## Summary schema

`history --format summary` returns:

```yaml
range:
  since: ISO-8601
  until: ISO-8601
filters: { ... }                    # echo of flags for reproducibility
totals:
  sessions: int
  duration_min: int
  projects: [name, ...]
  files_touched: int
  warnings: int                     # malformed JSONL lines skipped
sessions:
  - <Event as above>
```

The `filters` block echoes the invocation's flags so a summary file is self-describing.

## Filter order

Filters apply in this order, cheapest first:

1. Date window (`--since`, `--until`, `--date`)
2. Project (`--project`)
3. Tool filter (`--tools read,edit,bash`)
4. Grep (`--grep <regex>`)
5. Query (`--query <intent>`)

Deterministic filters run first because `--query` is expensive: it requires the agent to read candidate session summaries and classify each one.

## `--query` semantics

`--query` is a semantic filter. The agent reads candidate sessions' summaries and snippets and classifies each as relevant or irrelevant to the stated intent using its own reasoning. There are no embeddings and no index.

`--grep` is literal regex matching over message text and bash commands. Fast, deterministic, no agent involvement.

The two combine with AND. If both are supplied, a session must pass `--grep` and then pass `--query`.

Example:

```
/almanac:history --grep "useEffect" --query "sessions where I debugged stale closures"
```

## Scaling limits

The agent-reading approach is fine up to a few hundred sessions in a single `--query` call. Beyond that, narrow with `--date` or `--project` first. A week of intensive use typically produces 20-80 sessions; a year, a few thousand.

No caching or indexing is planned. Primitives stay primitive. If you need cross-year search, write a lens that calls `history` in a loop over monthly windows and synthesizes the results.

## Malformed lines

JSONL lines that fail to parse are skipped silently during enumeration and counted in `totals.warnings`. A single bad line never fails a run.

If `warnings > 0` and you want detail, run `history --format raw` on the same window and inspect the files directly.
