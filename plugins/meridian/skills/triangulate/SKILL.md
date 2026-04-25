---
name: triangulate
description: Verify an external-system claim across multiple primary sources before asserting it or acting on it. Auto-invokes when about to claim how a binary/protocol/format/API behaves, when pairing a code edit with confidence-escalation language, when deriving runtime output from code design without reading actual output, or when authoring a spec against an unread existing config in the repo.
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

## When This Triggers (Orchestrator Self-Check)

Auto-invocation is a model self-check, not a hook-driven mechanism. Before emitting any response, run these self-check questions. If any answer is yes, dispatch the triangulate agent and complete the audit BEFORE the response goes out.

1. **External-system claim** — am I about to assert how a binary, protocol, format, or external API behaves? ("the binary does X", "the format is Y", "the protocol uses Z", "the API returns W")
2. **Confidence-escalation paired with an edit** — am I about to perform a code edit AND use words like "smoking gun", "confirmed", "now I see", or "verified" in the same response?
3. **"Code does X so output is Y"** — am I deriving claims about runtime output from reading code design, without having read an actual output artifact (log, dump, runtime trace)?
4. **Spec authoring against an existing config** — am I writing a schema/format/spec for a system that already has a config file in the repo I haven't read?
5. **User-correction → re-claim** — did the user just correct me ("wait", "actually", "no") and am I now restating the corrected claim? If yes, audit the re-claim.

**Manual:** User invokes `/meridian:triangulate "<claim>"` to audit a specific claim explicitly.

## Process

When triangulate fires (auto from a self-check, or manually via `$ARGUMENTS`):

1. **Identify the claim** — one sentence, in scope. If the claim isn't already a clear sentence in the conversation, articulate it explicitly before dispatching.
2. **Dispatch the `meridian:triangulate` agent** as a subagent (`subagent_type: meridian:triangulate`). Prompt body: the claim text, candidate source paths (whatever the orchestrator can identify — file paths, addresses, URLs, sister-repo references, ticket links, runtime artifacts, etc.), and the Ground Truth Audit format below. The agent's system prompt already contains the HARD-GATE and reads `references/source-kinds.md` to classify sources.
3. **Validate the returned audit** against the HARD-GATE: ≥2 different-kind sources required for `confidence: high`; no forbidden confidence words inline; no edits performed by the agent.
4. **Stitch the inline row** into the active spec/sketch under `## Ground Truth Audit` (create the heading if missing). The active spec/sketch is the most recently-written file under `.meridian/specs/` or `.meridian/sketches/` — or a path the caller passed in.
5. **Write the full audit file** to `.meridian/audits/YYYY-MM-DD-<claim-slug>.md`. Slug rules: lowercase, ASCII-fold, non-alphanumeric → hyphen, collapse, trim, truncate to 60 chars. Audits are immutable — on filename collision, append `-2`, `-3`. Never overwrite an existing audit.
6. **If the gate is violated** (only one source found, sources disagree, agent returned `confidence: high` with same-type sources, etc.):
   - **Interactive mode (default):** surface to the user via `AskUserQuestion` with options "Re-dispatch with broader source candidates" / "Accept lower confidence" / "Halt". Do not silently lower confidence and proceed.
   - **Autonomous (`auto` skill active):** `AskUserQuestion` is unavailable. Lower the audit's `confidence` to the level the evidence supports, set `code_edit_gated: true` if it wasn't already, write the audit (including a "second source needed: <what kind>" note in `Could Be Wrong If`), and DO NOT perform any code edit that depended on the violated claim. Document the lowered-confidence claim in the autonomous mode's final summary so the user sees it on return.

## Audit Row Format (inline in active spec/sketch)

```markdown
### Claim: <one sentence>
- sources: <type>:<path>:<loc>, <type>:<path>:<loc>
- confidence: high | medium | low
- audit: .meridian/audits/<file>.md
```

The two-different-`type`s rule is a precondition for `confidence: high` only. Lower-confidence rows MAY have 0, 1, or 2+ sources of any kind combination. The `type:` field is free-form — the agent commits to a kind label that names the source's lineage. See `references/source-kinds.md` for what counts as a kind and what "different kind" means; the agent reads that file when classifying sources. There is no closed enum.

## Audit File Format (`.meridian/audits/<file>.md`)

The agent returns this body. Write it verbatim:

```markdown
# Ground Truth Audit: <claim>

## Claim
<one sentence>

## Primary Source 1
- type: <free-form kind label per references/source-kinds.md>
- path: <file or address>
- location: <line/range/EA>
- what it shows: <quote or short summary>

## Primary Source 2
[same shape — must have a different `type` than Source 1 if confidence is high]

## Disagreement Check
- Where the two sources should agree: <...>
- Where they actually agree: <...>
- Where they disagree (if at all): <...>

## Confidence
high | medium | low

## Could Be Wrong If
<one sentence — concrete falsifier the orchestrator or a future agent can check>

## Code Edit Gated
true | false (true if the next action depends on this claim)
```

## Integration

- **Predecessors:** `meridian` routing (auto on lens triggers), `brainstorm`, `execute`, `debug`, `sketch`, or direct invocation
- **Successors:** Returns to caller with the audit row reference. Caller proceeds with the verified claim or surfaces the gate violation.
- **May invoke:** `meridian:triangulate` agent (heavy multi-source reading)
- **On completion:** Re-evaluate the next user message against the routing table. Returns to calling skill.
