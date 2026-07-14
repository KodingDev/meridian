# Invocation-boundary evaluation

Checks that Meridian's narrow model disciplines can activate while ordinary requests do not enroll the user in formal workflows. It runs against the real plugin on Sonnet and makes paid API calls, so it is on-demand rather than an offline CI gate.

## Run

Install dependencies and provide `ANTHROPIC_API_KEY` in a gitignored `.env`, then run:

```text
pnpm eval
pnpm eval:view
```

## Coverage

- `scenarios/positive.yaml` checks model-owned disciplines with observable triggers.
- `scenarios/negative.yaml` checks that ordinary feature, implementation, review, commit, and documentation requests do not implicitly invoke user-owned flows.

Explicit slash or tagged skill invocation is a host command boundary, not a model routing decision, and is covered by skill metadata consistency tests rather than this single-turn provider harness.

Profile resolution, adapter composition, malformed configuration, and host output shapes are deterministic offline tests. Live adapter behavior requires a runner that can select the target model and expose its real session-start model payload. The current Sonnet-only promptfoo runner cannot represent Opus 4.8, Sol, or Fable coverage faithfully, so it does not pretend to. Add provider-specific cases when those models are executable through this harness.

## Adding a scenario

For a model discipline, assert `skill-used: meridian:<skill>`. For a manual flow boundary, assert that `metadata.skillCalls` is empty. Keep prompts self-contained and tie every positive trigger to the skill description.
