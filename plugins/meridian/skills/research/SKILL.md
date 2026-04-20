---
name: research
description: Use when touching external APIs, libraries, or patterns where training data may be outdated
argument-hint: "[query or topic to research]"
---

<HARD-GATE>
Do NOT trust training data for external API signatures, library behavior, or version compatibility. Verify against live documentation before returning results. You MUST call at least one web-fetching tool (WebFetch or WebSearch) before concluding — reasoning from memory does not satisfy this skill.
</HARD-GATE>

# Research

Verify before you build. Training data is a starting point — live documentation is truth.

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

1. **Identify what needs verification** — specific API signatures, behavior, configuration options, version compatibility. Be precise about what you're looking for.
2. **Search official documentation first** — web search targeting official docs sites, API references, and changelogs.
3. **If official docs are insufficient** — search authoritative community sources: GitHub issues, release notes, migration guides, official blog posts.
4. **Never** infer API shape from local `node_modules` type definitions alone. Types can be incomplete, outdated, generated incorrectly, or missing runtime behavior.
5. **Never** trust training data for specific API signatures, default values, or configuration options without verification.
6. **Consolidate findings** — return facts, not reasoning.

## What to Return

- Verified API signatures with source URLs
- Version-specific behavior notes
- Code examples from official docs
- Gotchas or breaking changes
- "Could not verify" for anything unconfirmed — with explanation of what was tried

## When Research Fails

- **Official docs unavailable or don't cover the topic:** State what couldn't be verified and why.
- **Claim is critical to implementation:** Consult the user before proceeding with unverified assumptions.
- **Claim is peripheral:** Proceed with a clear caveat noting the unverified assumption.
- **Never** silently proceed with unverified information as if it were confirmed.

## What NOT to Return

- Search strategy or reasoning about where to look
- Confidence assessments ("I'm fairly sure...")
- Speculation about unverified behavior

Use `$ARGUMENTS` as the research query if invoked directly by the user.

## Integration

- **Predecessors:** `brainstorm`, `debug`, `execute`, or direct invocation
- **Successors:** Returns to caller
- **May invoke:** —
- **On completion:** Re-evaluate the next user message against the routing table. Returns to calling skill.
