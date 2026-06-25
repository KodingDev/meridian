# Skill-routing eval

Verifies that representative prompts route to the correct Meridian skill (or none),
against the real plugin, on **Sonnet** (`claude-sonnet-4-6`) — the routing baseline:
if Sonnet can't route a prompt, the design is moot. This is **on-demand dev tooling,
not a CI gate** — it makes live, paid API calls (a full run is a few turns of the
agent per scenario).

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
pnpm eval        # run the corpus on Sonnet
pnpm eval:view   # open the pass/fail matrix
```

## What it checks

- `scenarios/positive.yaml` — one prompt per routable skill; asserts
  `skill-used: meridian:<skill>`.
- `scenarios/negative.yaml` — trivial prompts; asserts no skill fired.
- `scenarios/reroute.yaml` — terse "still broken" replies; asserts `meridian:debug`
  (the `UserPromptSubmit` reroute hook).

Self-contained prompts (where the intent is fully in the message) route reliably. A
scenario whose correct route depends on context the prompt alone doesn't carry — a
prior failed fix for a reroute, an existing spec for `execute` — is not a meaningful
single-turn test; see the Known gap.

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
