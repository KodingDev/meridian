# Skill-routing eval

Verifies that representative prompts route to the correct Meridian skill (or none),
against the real plugin, across Claude tiers. This is **on-demand dev tooling, not a
CI gate** — it makes live, paid API calls.

## Prerequisites

- Dev dependencies installed: `pnpm install`.
- An Anthropic API key in a gitignored `.env` at the repo root:

  ```
  ANTHROPIC_API_KEY=sk-ant-...
  ```

  promptfoo loads `.env` automatically. `.env` is gitignored — never commit it.
  Alternatively, set `apiKeyRequired: false` in `promptfooconfig.yaml` to run against
  a local Claude Code login.

## Run

```
pnpm eval        # run the corpus across opus / sonnet / haiku
pnpm eval:view   # open the comparative pass/fail matrix
```

## What it checks

- `scenarios/positive.yaml` — one prompt per routable skill; asserts
  `skill-used: meridian:<skill>`.
- `scenarios/negative.yaml` — trivial prompts; asserts no skill fired.
- `scenarios/reroute.yaml` — terse "still broken" replies; asserts `meridian:debug`
  (the `UserPromptSubmit` reroute hook).

All seed scenarios are expected to pass on `claude-opus-4-8`. Sonnet and Haiku are
tracked comparatively, not gated — lower tiers route less reliably.

## Adding a scenario

Append to the matching file:

```yaml
- vars:
    prompt: "<the user message>"
  assert:
    - type: skill-used
      value: meridian:<skill> # or a javascript skillCalls.length===0 check for "none"
  description: "<why this is the correct route>"
```

Every expected route must trace to a documented routing rule (the orientation table
or a skill description), not intuition. When a real misroute surfaces, add it here.

## Known gap

Authentic **mid-flow re-routing** (a failure signal arriving _during_ an active skill)
needs prior conversation turns, which the `anthropic:claude-agent-sdk` provider models
via session `resume`/`continue` rather than a declarative fixture. It is deferred until
that mechanism (or a headless-CLI fallback) is wired; the single-turn reroute cases
cover the hook itself.
