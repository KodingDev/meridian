---
name: research
description: Use when touching external APIs, libraries, or patterns where training data may be outdated
argument-hint: "[query or topic to research]"
---

<HARD-GATE>
Do NOT trust training data for external API signatures, library behavior, or version compatibility. Verify against live documentation before returning results. You MUST dispatch the `meridian:research` agent (which calls a web-fetching tool) before concluding — reasoning from memory does not satisfy this skill.
</HARD-GATE>

# Research

Verify before you build. Training data is a starting point — live documentation is truth. This skill is a thin dispatcher: the heavy doc-reading lives in the `meridian:research` plugin agent so verification work doesn't bloat the orchestrator's context.

## When This Triggers

**Auto (invoke this automatically — don't wait for the user to ask):**

- You're about to use an external API and aren't certain of the current signature
- A brainstorm or debug session touches a library you haven't verified
- The user mentions a tool/service/API you don't have verified knowledge of
- Task involves a library version where behavior may have changed
- About to write code based on memory of an API
- Any HARD-GATE would fire if you proceeded without verification

**Manual:** User invokes `/meridian:research "query"`

## Process

1. **Construct the query.** If invoked manually, use `$ARGUMENTS`. Otherwise restate the specific verification need (API signature, behavior, configuration option, version compatibility) in one or two sentences.
2. **Dispatch the `meridian:research` agent** as a subagent (`subagent_type: meridian:research`). Prompt body: the query and any context the agent needs to find the answer (target library version, framework, etc.). Do NOT include conversation history or your reasoning about the problem.
3. **Return the agent's verdict to the caller verbatim.** The agent returns verified facts with source URLs (or "Could not verify" with explanation). Don't paraphrase, don't summarize, don't add hedging.

## HARD-GATE Rationale (Dual-Location Enforcement)

The HARD-GATE above duplicates the agent's gate intentionally — the skill's gate is the contract callers (other skills using `invoke meridian:research`) rely on; the agent's gate is the operative rule the agent itself executes against. Keep both wordings aligned to prevent drift.

## When Research Fails

If the agent returns "Could not verify":

- **Claim is critical to implementation:** Consult the user before proceeding with unverified assumptions.
- **Claim is peripheral:** Surface the unverified assumption explicitly to the caller; do NOT silently proceed as if confirmed.

## Integration

- **Predecessors:** `brainstorm`, `debug`, `execute`, `sketch`, or direct invocation
- **Successors:** Returns to caller
- **May invoke:** `meridian:research` agent (heavy doc-reading)
- **On completion:** Re-evaluate the next user message against the routing table. Returns to calling skill.
