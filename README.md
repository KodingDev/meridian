# Meridian

Claude Code plugin for development workflows that don't fall apart in long sessions.

## Why

[Superpowers](https://github.com/obra/superpowers) is great. Skill-based workflows, iterative spec review, subagent-driven development — all genuinely good ideas that I used for a long time. But some patterns kept showing up that I wanted to fix:

Agents get confident in their own prior reasoning. If you review code, fix stuff, then review again — the second pass comes back suspiciously clean. The agent's own reasoning from the first review is right there in context, and it can't really fathom that it missed something when its own thoughts are telling it everything was fine. Meridian isolates review subagents so the orchestrator only ever sees defects and a verdict, not the reviewer's internal reasoning.

They trust their training data way too much. Confidently writing code against APIs that have changed, using library features that don't work the way they remember — then wasting ages debugging when a quick docs check would've caught it upfront. Meridian verifies external APIs against live documentation before writing code.

Skill systems can be too rigid. Not everything needs the full brainstorm -> plan -> execute pipeline. Changing a button color shouldn't require a design spec. Meridian uses judgment about what warrants ceremony and what just needs doing.

Agents commit stuff you didn't ask for. Spec files staged automatically, AI attribution in every message, design docs forced past your gitignore. Meridian doesn't commit anything without asking, doesn't stage spec files, and doesn't put "Co-Authored-By: Claude" in your commits.

They don't push back enough. If you ask for something that'll cause problems, the agent should say so — with evidence and actual alternatives, each with an honest case made for it. And once you've picked a direction, it should go all in, not half-ass it and relitigate in review.

Hard-won knowledge dies with the session. You debug something for two hours, nail the root cause, and next session the agent suggests the exact approach you already ruled out. Meridian has a documentation skill for capturing gotchas, debugging context, and "we already tried this" notes so future sessions don't start from scratch.

## Skills

| Skill | Does |
|-------|------|
| `research` | Verify APIs/libs against live docs before implementing |
| `brainstorm` | Design exploration -> spec through conversation |
| `execute` | Implement from spec with verification gates |
| `delegate` | Dispatch subagents with clean context isolation |
| `debug` | Root-cause investigation, no fixes without understanding |
| `review` | Code review via isolated subagent |
| `respond` | Evaluate review feedback before acting on it |
| `commit` | Clean git commits, no AI attribution |
| `document` | Human-readable docs from resolved work |

## What gets installed

- A `Meridian` output style applied automatically while the plugin is enabled (overrides any `/output-style` selection while loaded). It carries the durable principles — three pillars, voice, commit-attribution override, the challenge protocol — directly in the system prompt rather than relying on per-turn reminders.
- A session-start hook that injects the routing table and active-mode triggers as a quiet system reminder at the start of every session, so the orientation is felt rather than announced.
- The skills below, dispatched by judgement against the routing table.

## Install

### Claude Code

```
/plugin marketplace add KodingDev/meridian
/plugin install meridian@meridian
```

### Cursor

Install from the [Cursor plugin marketplace](https://cursor.com/marketplace), or enable **Third-party skills** in Cursor Settings → Features if you use the Claude plugin bundle.

Hooks are Node scripts (`node ./hooks/*.mjs`) — no Git Bash or shell polyglot required. Session orientation injects via `additional_context` on `sessionStart`. If hooks fail silently, check View → Output → **Hooks** and restart Cursor after updating the plugin.

### GitHub Copilot CLI

Copilot CLI installs the same plugin via its `/plugin` commands and loads the skills and subagents directly. Subagent `tools` are declared as YAML arrays of Claude tool names (`[Read, Grep, Glob, Bash, …]`); Copilot resolves these case-insensitively to its own primitives (`read`, `search`, `execute`, `web`), so the agents get full file/search/shell/web access rather than the bare baseline.

Hooks ship in Copilot's own format: Copilot's command schema treats `command` as a shell string and has no `args` array, so the Claude exec-form config would run a bare `node`. Copilot is pointed at `hooks/hooks-copilot.json` via `.plugin/plugin.json` (a manifest slot Copilot reads but Claude and Cursor don't). Session orientation injects via a flat `additionalContext` on `sessionStart`; prompt submission is state-only, because Copilot's `userPromptSubmitted` hook cannot inject context (same ceiling as Cursor).

Hook tests: `node --test test/meridian-hooks.test.mjs`

## Credit

Built on ideas from [superpowers](https://github.com/obra/superpowers) by Jesse Vincent — the skill-based workflow, subagent development, and iterative spec review all come from there. Meridian wouldn't exist without it.

Orchestration approach informed by Anthropic's [context engineering research](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) and the [Claude Certification Guide](https://claudecertificationguide.com).

## License

MIT
