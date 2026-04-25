# Source Kinds

The triangulate agent classifies each source it reads under a free-form `type:` label. The label discriminates *kinds* of evidence — not technologies, not file extensions. Two sources of "different kind" are sources where, if both said the same thing, the agreement would be meaningful — because they reach the claim through different lineages.

There is no closed enum. The agent commits to a kind label honestly per claim. When in doubt, prefer the label that makes the cross-source agreement most informative.

## What counts as a kind

A kind is a *lineage* — how this source came to know what it claims. Kinds the agent has named in past audits, illustrative not exhaustive:

- `ida_decompile` — output of decompiling a binary
- `python_script` — original or decompiled script source
- `runtime_log` — captured runtime output (a log line, a dump, a network trace, a UI screenshot)
- `official_docs` — vendor or upstream documentation
- `config_file` — a settings/config file that drives runtime behavior
- `code_path` — project source code outside scripts and config
- `sister_repo_pattern` — an established pattern in a sibling repository the project follows
- `ticket_or_charter` — a Linear/Jira/GitHub issue, or a project's stated charter / design rule
- `live_url_render` — the actual rendered page or API response, not the code that produces it
- `build_artifact` — a built `.dll`, generated source, or other derived output read as ground truth
- `language_ecosystem_precedent` — "how Gradle handles this" / "how Rails does it" — a well-known pattern in another ecosystem
- `vendor_spec` — a wire-format spec, opcode table, or printed standards document

Use whichever label honestly describes how the source got its knowledge. Invent new labels when the existing list doesn't fit. Do not retreat to `code_path` because it's safe — vague labels make the gate unable to bind.

## What "different kind" means

Two sources are different kind if their *lineages* are different — not their file paths, not their formats, not their authors.

- Two `.py` files, one in the project and one in a sister repo, are different kind only if the sister-repo file functions as a *pattern reference* (`sister_repo_pattern`), not as project code.
- A vendor PDF and a vendor's online docs portal are the same kind (`official_docs`) — same lineage.
- An IDA decompile of `Func_X` and a runtime log showing `Func_X`'s output are different kind (`ida_decompile` vs `runtime_log`) — the binary tells you what the code is, the log tells you what actually happened.
- A `.json` config file and the same config rendered into the running process's state are different kind (`config_file` vs `runtime_log`) — one is the input, one is the observed effect.

If the agent can't articulate why two sources have different lineages, they are the same kind for the purposes of the gate.

## What the gate enforces

The HARD-GATE rule is "two sources of different `type` for `confidence: high`". This file defines `type`. With a free-form string, the gate works on whatever distinction the agent commits to — and the agent must commit to a distinction that survives a defensibility check.

If the agent labels two sources as different kinds without a reason, that's a gate violation. The orchestrator's review of the returned audit (per the triangulate skill) catches this.
