---
name: triangulate
description: Verify a specific-value or behavior claim across multiple primary sources before asserting or acting on it. Auto-invokes before asserting a value with a definite answer outside this conversation — API/protocol/format behavior, design tokens, computed runtime values, config/dependency fields, observable UI state — that you haven't read the source artifact for this session; also on code-edit-plus-confidence-escalation, output claims derived from code without reading output, and spec authoring against an unread config/token file. Full trigger self-check in the body.
argument-hint: "[optional claim to audit]"
---

<HARD-GATE>
You MUST NOT mark `confidence: high` with fewer than 2 different-kind primary sources.

You MUST NOT perform a code edit if any audited claim it depends on has `code_edit_gated: true` AND `confidence != high`.

You MUST NOT use the words "confirmed", "verified", "smoking gun", "definitive", "canonical", "authoritative" inline unless tied to an audit row with `confidence: high`. If you catch yourself reaching for one of these words, stop and check the audit.
</HARD-GATE>

# Triangulate

A specialist lens for claim-confidence. Triangulate forces source rotation and surfaces doubt at output time. The heavy multi-source reading lives in the `meridian:triangulate` plugin agent so verification work doesn't bloat the orchestrator's context.

Lenses compose with active skills — you can be in `brainstorm`, `execute`, `debug`, or `sketch` and still trigger triangulate. The audit lives in the active spec/sketch so future-you reading it sees the flag mid-execute.

## Two Tiers

The lens has two tiers, and the default is cheap on purpose — a lens that only knows one expensive move gets skipped under task pressure, which is the exact failure that lets wrong claims ship.

- **Tier 1 — Ground (default, always-on, no ceremony).** When a trigger below fires, the baseline action is simply: read the source-of-truth artifact *this turn* before you assert — grep it, Read it, run the command, look at the screenshot. Then state the claim with that evidence. No subagent, no audit file, no spec row. This is the overwhelming majority of cases and costs one read. Do it silently.
- **Tier 2 — Triangulate (escalation, heavy).** Dispatch the `meridian:triangulate` agent and write a Ground Truth Audit only when grounding alone won't settle it: **candidate sources may disagree** (binary vs. decompile vs. runtime trace), the claim **gates an expensive or irreversible action**, a single source isn't enough to trust, or **the user already pushed back on this claim once**. Tier 2 is for contested or load-bearing claims — not for every value lookup.

Never let "Tier 2 feels like a lot" become "so I'll assert from memory." The escape hatch from heavy ceremony is Tier 1, not skipping. If you catch yourself reaching for one of these — *"should be right"*, *"I'm confident"*, *"it almost certainly does X"*, *"pretty sure the function is named…"*, *"this is probably the value"* — that hedge is the tripwire: you have not read the artifact, so read it (Tier 1) before the sentence goes out.

## When This Triggers (Orchestrator Self-Check)

Auto-invocation is a model self-check, not a hook-driven mechanism. Before emitting any response, run these self-check questions. If any answer is yes, Tier 1 grounding is mandatory before the response goes out; escalate to Tier 2 only on the conditions above.

The core question behind every trigger: **would a reader checking my claim against the actual artifact disagree with what I'm about to write?** If yes, and I haven't read that artifact this session, ground before claiming.

1. **Specific-value or behavior claim** — am I about to assert a specific value, behavior, output, or state that has a definite answer outside this conversation, without having directly read the source-of-truth artifact in this session? This is broader than it sounds and is the most under-fired trigger. It covers:
   - **External systems** — "the binary does X", "the protocol uses Y", "the API returns Z", "the format encodes W"
   - **Stored-state values** — CSS token values, design-system palette colors, theme variables, Tailwind config fields, package.json fields, lockfile-resolved dependency versions, environment-variable defaults
   - **Computed runtime values** — "neutral-700 is at L=0.27", contrast ratios, parsed font sizes, layout measurements, build outputs, rendered HTML structure
   - **Observable UI state** — "the dropdown shows X when Y", "the button is disabled in state Z", "the toast appears for N seconds"
   - **Repo state** — what's in a file, what a function returns, which exports a module has, what tests exist — when I haven't grepped or read it in this conversation
2. **Confidence-escalation paired with an edit** — am I about to perform a code edit AND use words like "smoking gun", "confirmed", "now I see", or "verified" in the same response?
3. **"Code does X so output is Y"** — am I deriving claims about runtime output from reading code design, without having read an actual output artifact (log, dump, runtime trace, browser screenshot, computed CSS dump, network response)?
4. **Spec authoring against an existing config / theme / token file** — am I writing a schema, format, or spec for a system that already has a config file, theme file, token CSS, Tailwind config, or design-system definition in the repo I haven't read? "Config" here is shape, not file extension — token CSS counts, theme JSON counts, Tailwind config counts.
5. **User-correction → re-claim** — did the user just correct me ("wait", "actually", "no") and am I now restating the corrected claim? If yes, audit the re-claim.

A useful negative test before skipping: if I had to bet $100 that my claim matches the artifact, would I take the bet at even odds? If no — fire the lens. The cost of an audit is one subagent dispatch; the cost of a wrong claim users notice is trust.

**Manual:** User invokes `/meridian:triangulate "<claim>"` to audit a specific claim explicitly.

## Process (Tier 2 — the heavy audit)

This is the escalation path only. For Tier 1, there is no process: read the artifact, then assert. Run the steps below when a triggered claim is contested or load-bearing per the Two Tiers conditions, or when invoked manually via `$ARGUMENTS`:

1. **Identify the claim** — one sentence, in scope. If the claim isn't already a clear sentence in the conversation, articulate it explicitly before dispatching.
2. **Dispatch the `meridian:triangulate` agent** as a subagent (`subagent_type: meridian:triangulate`). Prompt body: the claim text, candidate source paths (whatever the orchestrator can identify — file paths, addresses, URLs, sister-repo references, ticket links, runtime artifacts, etc.), and the Ground Truth Audit format (`references/audit-format.md`). The agent's system prompt already contains the HARD-GATE and reads `references/source-kinds.md` to classify sources.
3. **Validate the returned audit** against the HARD-GATE: ≥2 different-kind sources required for `confidence: high`; no forbidden confidence words inline; no edits performed by the agent.
4. **Stitch the inline row** into the active spec/sketch under `## Ground Truth Audit` (create the heading if missing). The active spec/sketch is the most recently-written file under `.meridian/specs/` or `.meridian/sketches/` — or a path the caller passed in.
5. **Write the full audit file** to `.meridian/audits/YYYY-MM-DD-<claim-slug>.md`. Slug rules: lowercase, ASCII-fold, non-alphanumeric → hyphen, collapse, trim, truncate to 60 chars. Audits are immutable — on filename collision, append `-2`, `-3`. Never overwrite an existing audit.
6. **If the gate is violated** (only one source found, sources disagree, agent returned `confidence: high` with same-type sources, etc.):
   - **Interactive mode (default):** surface to the user via `AskUserQuestion` with options "Re-dispatch with broader source candidates" / "Accept lower confidence" / "Halt". Do not silently lower confidence and proceed.
   - **Autonomous (`auto` skill active):** `AskUserQuestion` is unavailable. Lower the audit's `confidence` to the level the evidence supports, set `code_edit_gated: true` if it wasn't already, write the audit (including a "second source needed: <what kind>" note in `Could Be Wrong If`), and DO NOT perform any code edit that depended on the violated claim. Document the lowered-confidence claim in the autonomous mode's final summary so the user sees it on return.

## Audit Formats

Both the inline row (stitched into the active spec/sketch at step 4) and the full audit file (written at step 5) follow `references/audit-format.md`. Read it before writing either.

## Integration

- **Predecessors:** `meridian` routing (auto on lens triggers), `brainstorm`, `execute`, `debug`, `sketch`, or direct invocation
- **Successors:** Returns to caller with the audit row reference. Caller proceeds with the verified claim or surfaces the gate violation.
- **May invoke:** `meridian:triangulate` agent (heavy multi-source reading)