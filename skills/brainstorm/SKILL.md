---
name: brainstorm
description: Use before any new feature, significant change, or architectural decision
argument-hint: "[feature or idea to design]"
---

# Brainstorm

Turn ideas into thorough specs through collaborative dialogue.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until the spec is written and the user has approved it.
</HARD-GATE>

## Process

1. **Explore project context** — check files, docs, recent commits, existing patterns. Understand what exists before proposing changes.

   Also consult the auto-memory system (`MEMORY.md` is already in context). Read any `feedback` or `user` memories that bear on this work — recurring rules the user has stated before ("test before claiming done", "no AI attribution in commits", "always use existing utils", "no comment slop") belong pre-populated in the spec's User Constraints section, not waiting on the user to restate them session after session. If a memory is stale relative to the current code, trust the code and update or remove the memory rather than acting on it.

2. **Assess scope** — if the request spans multiple independent subsystems, decompose first. Each subsystem gets its own brainstorm -> spec -> execute cycle. Subsystems are "independent" when they don't share data models, UI components, or cross-cutting concerns. If two pieces need to agree on a shared interface, design them together.

3. **Identify research needs** — if the task involves external APIs, libraries, or patterns you haven't verified, invoke `meridian:research` before continuing. Do not design around assumptions about how an API works.

4. **Ask clarifying questions — but only when the answer changes the spec.** Questions are gates with cost: every `AskUserQuestion` stalls progress and trades the user's attention for information you could often have inferred. Ask only when *both* are true:

   - **Defaults would likely be wrong** — you genuinely cannot infer the right answer from the request, codebase, and prior conventions. If you can write a defensible draft and the user can redirect, that's not a clarifying question — that's a draft.
   - **The choice has multiple-edit-cost downside** — picking the wrong default means rewriting load-bearing structure later, not tweaking a label or copy string.

   If both are not clearly true, write the spec section first with your best inference (mark non-obvious assumptions explicitly so they're easy to spot) and let the user redirect during review (step 11). One batched question per brainstorm is the working default. Two is fine for a genuine architecture fork. Three or more is a smell — fold the rest into your spec as marked assumptions; users push back faster on a concrete draft than on a multiple-choice questionnaire.

   When you do ask, use `AskUserQuestion` with concrete options and batch related questions in a single call rather than spreading them across turns.

   When the user states a constraint or preference ("no X", "always use Y", "don't Z"), note it immediately for the spec's User Constraints section. These accumulate throughout the brainstorm. If the spec is already written, update it — constraints discovered during later discussion are just as binding.

5. **Challenge if needed** — if you believe the approach is wrong, follow the Challenge Protocol. Present all viable alternatives with genuine merits. Once the user decides, proceed with their choice fully.

6. **Propose approaches** — present 2-3 approaches via `AskUserQuestion`. Each option's label is the approach name, description covers tradeoffs and merits. Use the `preview` field for code snippets or architecture sketches when they'd help the user compare. Put your recommendation first with "(Recommended)" in the label.

7. **Present design in sections** — scaled to complexity. Simple sections get a few sentences. Complex sections get detail. Get user approval after each section before moving on.

8. **Write spec file** — save to `.meridian/specs/YYYY-MM-DD-<topic>.md`.
   - Required sections: **Overview**, **Requirements** (numbered, unambiguous), **Technical Design**, **Constraints**, **User Constraints**, **Acceptance Criteria**.
   - **User Constraints** captures explicit do/don't rules the user stated during brainstorm (e.g., "no glow effects", "use existing utils", "match existing page patterns"). These are non-negotiable implementation rules, distinct from technical Constraints.
   - Scale section depth to complexity — a simple feature gets brief sections, a complex system gets thorough ones.
   - `execute` will append a **Progress Log** section as implementation proceeds — the spec becomes the durable state record across sessions.

9. **Self-review the spec** — before dispatching the subagent reviewer:
   - Placeholder scan: any TBD, TODO, or incomplete sections? Fix them.
   - Internal consistency: do sections contradict each other on what to build?
   - Material ambiguity check: could a requirement be implemented two *different* ways? Pick one, make it explicit. Wording polish, synonym choices, and ambiguities whose readings converge on the same code are not material — skip them.
   - Fix inline. Don't flag — just fix.

10. **Spec review (isolated subagent)** — dispatch a subagent using the template at `spec-reviewer-prompt.md` in this directory. Paste the spec content and project CLAUDE.md into the prompt. The subagent returns only a material-issues list.

    **Loop rule:** re-review as long as each pass surfaces *material* issues and you address them. Stop when a pass returns "No material issues found" — or when a pass surfaces only wording nits and rephrasings. The exit condition is the shape of the findings, not a pass count. Don't cut a real review short, but don't keep dispatching to chase a perfect-prose verdict either.

11. **User reviews spec** — present the spec, ask for changes. Iterate if needed.

12. **Transition** — once approved, invoke `meridian:execute` to implement.

## Principles

- **YAGNI ruthlessly** — cut unnecessary features from every design.
- **Targeted improvements only** — where existing code has problems that affect the work (overgrown files, tangled responsibilities), fold the fix into the design; don't propose unrelated refactoring.

## Integration

- **Predecessors:** `meridian` routing, or direct invocation
- **Successors:** `execute`
- **May invoke:** `research`