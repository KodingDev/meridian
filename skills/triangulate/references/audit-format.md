# Ground Truth Audit — Formats

Two formats for a Tier-2 audit: the compact row stitched inline into the active spec/sketch, and the full file written to `.meridian/audits/`.

## Audit Row Format (inline in active spec/sketch)

```markdown
### Claim: <one sentence>

- sources: <type>:<path>:<loc>, <type>:<path>:<loc>
- confidence: high | medium | low
- audit: .meridian/audits/<file>.md
```

The two-different-`type`s rule is a precondition for `confidence: high` only. Lower-confidence rows MAY have 0, 1, or 2+ sources of any kind combination. The `type:` field is free-form — the agent commits to a kind label that names the source's lineage. See `source-kinds.md` for what counts as a kind and what "different kind" means; the agent reads that file when classifying sources. There is no closed enum.

## Audit File Format (`.meridian/audits/<file>.md`)

The agent returns this body. Write it verbatim:

```markdown
# Ground Truth Audit: <claim>

## Claim

<one sentence>

## Primary Source 1

- type: <free-form kind label per source-kinds.md>
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
