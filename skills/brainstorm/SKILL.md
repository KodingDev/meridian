---
name: brainstorm
description: Turn an idea into an approved implementation spec through collaborative design.
disable-model-invocation: true
argument-hint: "[feature or idea to design]"
---

# Brainstorm

Turn ideas into thorough specs through collaborative dialogue.

<HARD-GATE>
This flow produces an approved specification. Do NOT write code, scaffold a project, take implementation action, or invoke `meridian:execute`; the user owns the transition to implementation.
</HARD-GATE>

## Process

1. **Explore project context** — check files, docs, recent commits, existing patterns. Understand what exists before proposing changes.

   Also consult the auto-memory system (`MEMORY.md` is already in context). Read any `feedback` or `user` memories that bear on this work — recurring rules the user has stated before ("test before claiming done", "no AI attribution in commits", "always use existing utils", "no comment slop") belong pre-populated in the spec's User Constraints section, not waiting on the user to restate them session after session. If a memory is stale relative to the current code, trust the code and update or remove the memory rather than acting on it.

2. **Assess scope** — if the request spans multiple independent subsystems, decompose first. Each subsystem gets its own brainstorm -> spec -> execute cycle. Subsystems are "independent" when they don't share data models, UI components, or cross-cutting concerns. If two pieces need to agree on a shared interface, design them together.

3. **Identify research needs** — if the task involves external APIs, libraries, or patterns you haven't verified, invoke `meridian:research` before continuing. Do not design around assumptions about how an API works.

4. **Ask clarifying questions — but only when the answer changes the spec.** Questions are gates with cost: every question stalls progress and trades the user's attention for information you could often have inferred. Before asking anything, re-read what the user already handed you — the request, any linked plan, handoff doc, or spec — in full; the answer is usually already there, and a question it already answers reads as not having read it. Then ask only when *both* are true:

   - **Defaults would likely be wrong** — you genuinely cannot infer the right answer from the request, codebase, and prior conventions. If you can write a defensible draft and the user can redirect, that's not a clarifying question — that's a draft.
   - **The choice has multiple-edit-cost downside** — picking the wrong default means rewriting load-bearing structure later, not tweaking a label or copy string.

   If both are not clearly true, write the spec section first with your best inference (mark non-obvious assumptions explicitly so they're easy to spot) and let the user redirect during review (step 11). One batched question per brainstorm is the working default. Two is fine for a genuine architecture fork. Three or more is a smell — fold the rest into your spec as marked assumptions; users push back faster on a concrete draft than on a multiple-choice questionnaire.

   When you do ask, use the host's structured question tool with concrete options and batch related questions in a single call. If no structured question tool is available, ask the same question in plain text and wait.

   When the user states a constraint or preference ("no X", "always use Y", "don't Z"), note it immediately for the spec's User Constraints section. These accumulate throughout the brainstorm. If the spec is already written, update it — constraints discovered during later discussion are just as binding.

5. **Challenge if needed** — if you believe the approach is wrong, state the concern with evidence and present viable alternatives with genuine merits. Once the user decides, proceed with their choice fully.

6. **Propose approaches** — present 2-3 approaches through the host's structured question tool, or in plain text when that tool is unavailable. Each option's label is the approach name and its description covers tradeoffs and merits. Use previews for code snippets or architecture sketches when the host supports them. Put your recommendation first with "(Recommended)" in the label.

7. **Present design in sections** — scaled to complexity. Simple sections get a few sentences. Complex sections get detail. Get user approval after each section before moving on.

8. **Write spec file** — save to `.meridian/specs/YYYY-MM-DD-<topic>.md`.
   - Required sections: **Overview**, **Requirements** (numbered, unambiguous), **Technical Design**, **Constraints**, **User Constraints**, **Acceptance Criteria**.
   - **User Constraints** captures explicit do/don't rules the user stated during brainstorm (e.g., "no glow effects", "use existing utils", "match existing page patterns"). These are non-negotiable implementation rules, distinct from technical Constraints.
   - Scale section depth to complexity — a simple feature gets brief sections, a complex system gets thorough ones.
   - `execute` will append a **Progress Log** section as implementation proceeds — the spec becomes the durable state record across sessions.

9. **Self-review the spec**:
   - Placeholder scan: any TBD, TODO, or incomplete sections? Fix them.
   - Internal consistency: do sections contradict each other on what to build?
   - Material ambiguity check: could a requirement be implemented two *different* ways? Pick one, make it explicit. Wording polish, synonym choices, and ambiguities whose readings converge on the same code are not material — skip them.
   - Fix inline. Don't flag — just fix.

10. **Optional independent review** — use one isolated review pass only when the user requests it or the design is high-risk enough that a fresh perspective materially reduces risk. Fix material findings; do not loop for prose polish.

11. **User reviews spec** — present the spec, ask for changes. Iterate if needed.

12. **Transition** — once approved, stop with the approved spec. Tell the user they can invoke `meridian:execute` when they want implementation to begin. Do not invoke it on their behalf.

## Principles

- **YAGNI ruthlessly** — cut unnecessary features from every design.
- **Targeted improvements only** — where existing code has problems that affect the work (overgrown files, tangled responsibilities), fold the fix into the design; don't propose unrelated refactoring.
