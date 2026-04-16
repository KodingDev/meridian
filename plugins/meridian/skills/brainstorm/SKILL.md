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

## When to Self-Invoke

Invoke this skill automatically when:
- The user asks for a new feature or significant change
- The request involves architectural decisions or multiple components
- The user is describing what they want (not asking you to just do a small thing)
- You're uncertain about the right approach and need to explore options

## Process

1. **Explore project context** — check files, docs, recent commits, existing patterns. Understand what exists before proposing changes.

2. **Assess scope** — if the request spans multiple independent subsystems, decompose first. Each subsystem gets its own brainstorm -> spec -> execute cycle. Subsystems are "independent" when they don't share data models, UI components, or cross-cutting concerns. If two pieces need to agree on a shared interface, design them together.

3. **Identify research needs** — if the task involves external APIs, libraries, or patterns you haven't verified, invoke `meridian:research` before continuing. Do not design around assumptions about how an API works.

4. **Ask clarifying questions** — use `AskUserQuestion` with concrete options when possible. Focus on purpose, constraints, and success criteria. Batch related questions (up to 4) in a single call rather than asking one at a time across multiple turns.

   When the user states a constraint or preference ("no X", "always use Y", "don't Z"), note it immediately for the spec's User Constraints section. These accumulate throughout the brainstorm. If the spec is already written, update it — constraints discovered during later discussion are just as binding.

5. **Challenge if needed** — if you believe the approach is wrong, follow the Challenge Protocol (see `meridian` bootstrap skill). Present all viable alternatives with genuine merits. Once the user decides, proceed with their choice fully.

6. **Propose approaches** — present 2-3 approaches via `AskUserQuestion`. Each option's label is the approach name, description covers tradeoffs and merits. Use the `preview` field for code snippets or architecture sketches when they'd help the user compare. Put your recommendation first with "(Recommended)" in the label.

7. **Present design in sections** — scaled to complexity. Simple sections get a few sentences. Complex sections get detail. Get user approval after each section before moving on.

8. **Write spec file** — save to `docs/meridian/specs/YYYY-MM-DD-<topic>.md`.
   - Do NOT commit. Do NOT stage. The spec is a working artifact, not a git artifact.
   - Required sections: **Overview**, **Requirements** (numbered, unambiguous), **Technical Design**, **Constraints**, **User Constraints**, **Acceptance Criteria**.
   - **User Constraints** captures explicit do/don't rules the user stated during brainstorm (e.g., "no glow effects", "use existing utils", "match existing page patterns"). These are non-negotiable implementation rules, distinct from technical Constraints.
   - Scale section depth to complexity — a simple feature gets brief sections, a complex system gets thorough ones.
   - `execute` will append a **Progress Log** section as implementation proceeds — the spec becomes the durable state record across sessions.

9. **Self-review the spec** — before dispatching the subagent reviewer:
   - Placeholder scan: any TBD, TODO, incomplete sections, vague requirements? Fix them.
   - Internal consistency: do sections contradict each other?
   - Ambiguity check: could any requirement be interpreted two ways? Pick one, make it explicit.
   - Fix inline. Don't flag — just fix.

10. **Spec review (isolated subagent)** — dispatch a subagent using the template at `spec-reviewer-prompt.md` in this directory. Paste the spec content and project CLAUDE.md into the prompt. The subagent returns only an issues list — no reasoning, no praise. Fix issues, re-review until clean.

11. **User reviews spec** — present the spec, ask for changes. Iterate if needed.

12. **Transition** — once approved, invoke `meridian:execute` to implement.

## Key Principles

- **Structured questions** — use `AskUserQuestion` for choices and approvals; batch related questions rather than spreading them across turns
- **YAGNI ruthlessly** — cut unnecessary features from every design
- **Explore alternatives** — always propose 2-3 approaches before settling
- **Research gaps, don't guess** — if you're not sure how an API works, invoke research
- **Existing codebases: explore first** — follow existing patterns. Where existing code has problems that affect the work, include targeted improvements in the design. Don't propose unrelated refactoring.

## Working in Existing Codebases

- Explore the current structure before proposing changes
- Follow existing patterns unless they're actively harmful
- Where existing code has problems that affect the work (overgrown files, tangled responsibilities), include targeted improvements as part of the design
- Don't propose unrelated refactoring — stay focused on what serves the goal

## Integration

- **Predecessors:** `meridian` routing, or direct invocation
- **Successors:** `execute`
- **May invoke:** `research`
- **On completion:** Re-evaluate the next user message against the routing table. Common next: `execute`.
