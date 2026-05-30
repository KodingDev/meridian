# Why the Format-as-Gate Binds

Triangulate exists because exhortation ("verify before claiming") gets tuned out as the conversation grows. Format-as-gate replaces exhortation with structure: the audit format requires a `confidence:` field with a HARD-GATE on what counts as `high`, and confidence-escalation language ("verified", "smoking gun", "confirmed") cannot appear inline unless tied to an audit row that satisfies the gate.

This is not stylistic. The gate's binding mechanism is the structural requirement that the agent commit to a `type:` for each source it reads. With committed types, "two sources agreed" is checkable. Without, "I checked everything" is unfalsifiable.

## The four failure shapes the lens addresses

From retrospective failure analysis:

- **Shape A — Single-source authority.** The orchestrator latches onto the most recently read source and treats it as canonical. Other sources already in context are not cross-checked.
- **Shape B — Internal logic as output truth.** The orchestrator reasons from the design of new code about what its output will be, instead of reading the actual output.
- **Shape C — Spec from imagination.** The orchestrator authors a schema/format from chat memory while an existing config file sits unread on disk.
- **Shape D — Doubt collapse mid-turn.** A turn opens with "I should independently verify" and within the same response produces "Smoking gun" with a full table, no remaining hedges. The format being filled in has no slot for doubt, so doubt evaporates. **D is the engine; A/B/C are surface manifestations.**

## What the gate does

- Requires explicit `type:` on each source — forces the agent to name the lineage, not hand-wave.
- Requires "two different types" for `confidence: high` — forces source rotation before claiming high.
- Requires `Could Be Wrong If` — forces a concrete falsifier, which is a slot for doubt that doesn't disappear when the rest of the audit fills in.
- Requires `Code Edit Gated` — surfaces the load-bearing dependency between the claim and the next action.

The gate works against any honestly-committed `type:` value. See `source-kinds.md` for what counts as a kind. The gate does NOT require the agent pick from a closed enum — an earlier design did, and it covered the RE workflow it was authored from but missed every other shape (pipeline-vs-sister-repo, code-vs-rendered-page, library-internals-vs-project-charter, ticket-vs-implementation, build-artifact-vs-source). Closed enums make the lens domain-shaped despite advertising domain-agnostic.

## What the gate does not do

- It does not prevent honest low-confidence audits with one source. Lower confidence is the right answer when only one source is available; the gate just blocks calling that `high`.
- It does not enforce particular source kinds. The lens is domain-agnostic by design.
- It does not catch all multi-source failures. It catches the ones where confidence-escalation language is paired with insufficient sources — a structural slice, not a complete safety net. The agent's process is still required to read all candidate sources fresh, classify each honestly, and surface disagreement explicitly.
