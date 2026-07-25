# Meridian

Professional engineering discipline without taking ownership of your workflow.

Meridian gives coding agents one model-independent quality standard, lets projects supply their own customer and repository policy, and applies small model-specific corrections where a model has a repeatable failure mode. It does not route ordinary requests into mandatory planning, review, documentation, or commit pipelines.

## How it works

Meridian has four layers:

1. **Professional engineering standard** — shared expectations for correctness, evidence, security, maintainability, operability, delivery hygiene, user agency, proportionality, and stopping.
2. **Project policy** — your `CLAUDE.md`, `AGENTS.md`, and repository instructions define customer, compliance, tooling, deployment, rollback, and artifact requirements.
3. **Model adapters** — atomic corrections for observable quirks such as comment narration or recursive reviewing. They change steering, never the quality bar or authorization.
4. **Skills** — formal flows are user-owned; narrow engineering disciplines can be selected by the model inside an ordinary task.

The result is deliberately asymmetric: different models may receive different corrective wording, but every model owes the same professional outcome.

## Skills

### User-invoked flows

These run only when you invoke them. One flow never silently enrolls you in another.

| Skill | Purpose |
| --- | --- |
| `brainstorm` | Develop an idea into an approved implementation spec |
| `sketch` | Produce a lightweight contract for a small change |
| `execute` | Implement an approved spec or clear scope with proportionate verification |
| `review` | Perform a focused, report-only code review |
| `document` | Capture requested durable engineering knowledge |
| `auto` | Grant elevated autonomy for reversible, in-scope work |

Invoking a flow authorizes its ordinary documented behavior. Separate approval is still required for destructive operations, unrequested external effects, material scope expansion, and unresolved high-cost choices.

### Model-invoked disciplines

These are narrow internal tools, not workflow gates:

| Skill | Purpose |
| --- | --- |
| `commit` | Commit and pull request conventions, and the one-clean-commit flow |
| `debug` | Diagnose failures from evidence before fixing them |
| `research` | Verify unstable external behavior against primary sources |
| `triangulate` | Escalate contested or load-bearing claims beyond one source |
| `delegate` | Isolate genuinely independent or context-heavy work |
| `respond` | Evaluate review feedback while preserving user intent |

`commit` holds conventions and a flow. The conventions are reachable whenever a commit message or pull request description is being written, including by other skills. Reaching them authorizes nothing: committing, pushing, and opening or editing a pull request each still require an explicit request.

## Model profiles

At session start Meridian injects the professional standard followed by the adapters for the resolved profile. Resolution order is:

1. `MERIDIAN_MODEL_PROFILE`
2. exact model identifier
3. registered model-family prefix
4. host-local fallback
5. baseline standard only

Initial profiles are:

| Profile | Adapters | Mapped by |
| --- | --- | --- |
| `claude-opus` | comment narration, artifact overproduction | `claude-opus-` prefix |
| `fable` | none | `claude-fable-` prefix |
| `sol` | review recursion, depth escalation, workflow literalism, agreement seeking | environment override or fallback |

Profiles are named for model families rather than single releases, and families are matched by prefix so a new release in a known family keeps its corrections instead of silently dropping to the baseline.

Only model identifiers observed from host payloads or documented by the host are mapped automatically. A model outside a mapped family receives the baseline rather than a guessed profile.

Set a host-local fallback in `<state-base>/meridian/config.json`:

```json
{
  "fallbackProfile": "sol"
}
```

The state base is host-specific, such as `CODEX_HOME` for Codex. GitHub Copilot does not currently expose a model identifier in its documented session-start payload, so use the environment override or fallback there.

## Installation

### Claude Code

```text
/plugin marketplace add KodingDev/meridian
/plugin install meridian@meridian
```

### Cursor

Install Meridian from the Cursor plugin marketplace, or enable third-party skills and install the Claude plugin bundle.

### GitHub Copilot CLI and Codex

Install the same plugin bundle through the host's plugin support. Meridian ships host-specific hook manifests where their schemas differ. The session hook is read-only context composition; the existing pre-tool commit guard still blocks AI attribution and staging ignored `.meridian/` working artifacts where supported.

## Project policy

Use repository instructions for requirements that vary by customer or environment. The included `templates/CLAUDE.md` provides optional headings for security and compliance, required verification, deployment and rollback, repository artifacts, and allowed tools. Meridian intentionally ships no AWS-, employer-, customer-, or Stella-specific defaults.

## Development

```text
pnpm check
node --test test/meridian-hooks.test.mjs
```

The live evaluation harness is on-demand because it makes paid model calls:

```text
pnpm eval
pnpm eval:view
```

## Credit

Built on ideas from [Superpowers](https://github.com/obra/superpowers) by Jesse Vincent and informed by Matt Pocock's user-invoked/model-invoked skill split.

## License

MIT
