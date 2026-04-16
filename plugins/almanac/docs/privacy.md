# Privacy

## What transcripts contain

Claude Code session logs include:

- User prompts verbatim.
- Assistant responses verbatim.
- Tool-call arguments — including full bash command strings.
- File contents read by the agent.
- Tool output, including anything tools printed to stdout.

If you pasted a secret into a session, it is in the JSONL. If you exported an API key to a shell and the agent ran `env`, it is in the JSONL. If a tool printed a token to stdout, it is in the JSONL.

Almanac reads these files. Anything Almanac reads can flow into lens output unless redacted.

## Redaction

`reflect` output strips the following before writing a note. The canonical regex list is duplicated here and in `skills/reflect/SKILL.md` — keep both in sync.

- API keys and tokens:
  - `sk-(ant-)?[A-Za-z0-9_-]{20,}` (OpenAI / Anthropic)
  - `ghp_[A-Za-z0-9]{30,}`, `gho_[A-Za-z0-9]{30,}`, `ghs_[A-Za-z0-9]{30,}` (GitHub)
  - `xox[abpors]-[A-Za-z0-9-]{10,}` (Slack)
  - `AKIA[0-9A-Z]{16}` (AWS access key IDs)
  - JWTs: `eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}`
  - Generic 32+ character hex or base64 runs adjacent to `key`, `token`, `secret`, `password`, `bearer`
- Email addresses (`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`) — replaced with `[email]`.
- Absolute file paths pointing outside the current vault project — replaced with `[external-path]`.

Redaction is conservative. It errs toward stripping things that might be secrets rather than preserving readability. It is not a replacement for not pasting secrets into Claude in the first place.

Redaction does not apply to `history --format raw` (see below).

## Web search safety

`investigate` never sends raw session text to `WebSearch`. Search queries are constructed from:

- The topic argument you supplied.
- The built-in query shapes (e.g. `"<topic>" criticism`, `alternatives to "<topic>"`).

No transcript snippets, no file contents, no prompts are passed to the web. Your sessions stay local.

## Raw output

`history --format raw` emits the original JSONL lines verbatim with no redaction. Before printing, it asks for confirmation using this canonical string (mirrored in `skills/history/SKILL.md`):

```
WARNING: --format raw emits unredacted session transcripts. Output may contain API keys, tokens, email addresses, file contents, and bash command output. Continue?
```

Use `--format raw` only when you know what is in the files and where the output is going. The default format is `summary`.

## Outside the vault

Almanac writes nothing to your home directory. There is no:

- `~/.almanac/state.json`
- `~/.almanac/cache/`
- Scheduling registry
- Log file
- Session tracking file

Almanac reads from two places outside the vault:

- `~/.claude/projects/**/*.jsonl` — Claude Code's own transcripts. Read-only.
- `~/.almanac/lenses/*.md` — your optional user lenses. Read-only from Almanac's side; you create and edit them manually.

`~/.almanac/lenses/` is created by you, not by the plugin. Almanac never writes there.
