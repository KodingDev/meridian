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

2. **Assess scope** — if the request spans multiple independent subsystems, decompose first. Each subsystem gets its own brainstorm -> spec -> execute cycle. Subsystems are "independent" when they don't share data models, UI components, or cross-cutting concerns. If two pieces need to agree on a shared interface, design them together.

3. **Identify research needs** — if the task involves external APIs, libraries, or patterns you haven't verified, invoke `meridian:research` before continuing. Do not design around assumptions about how an API works.

4. **Ask clarifying questions** — one at a time. Prefer multiple choice when possible. Focus on purpose, constraints, and success criteria. Don't overwhelm.

5. **Challenge if needed** — if you believe the approach is wrong, follow the Challenge Protocol (see `meridian` bootstrap skill). Present all viable alternatives with genuine merits. Once the user decides, proceed with their choice fully.

6. **Propose approaches** — present 2-3 approaches with tradeoffs, genuine merits for each, and your recommendation with reasoning.

7. **Present design in sections** — scaled to complexity. Simple sections get a few sentences. Complex sections get detail. Get user approval after each section before moving on.

8. **Write spec file** — save to `docs/meridian/specs/YYYY-MM-DD-<topic>.md`.
   - Do NOT commit. Do NOT stage. The spec is a working artifact, not a git artifact.
   - Required sections: **Overview**, **Requirements** (numbered, unambiguous), **Technical Design**, **Constraints**, **Acceptance Criteria**.
   - Scale section depth to complexity — a simple feature gets brief sections, a complex system gets thorough ones.

9. **Self-review the spec** — before dispatching the subagent reviewer:
   - Placeholder scan: any TBD, TODO, incomplete sections, vague requirements? Fix them.
   - Internal consistency: do sections contradict each other?
   - Ambiguity check: could any requirement be interpreted two ways? Pick one, make it explicit.
   - Fix inline. Don't flag — just fix.

10. **Spec review (isolated subagent)** — dispatch a subagent using the template at `spec-reviewer-prompt.md` in this directory. Paste the spec content and project CLAUDE.md into the prompt. The subagent returns only an issues list — no reasoning, no praise. Fix issues, re-review until clean.

11. **User reviews spec** — present the spec, ask for changes. Iterate if needed.

12. **Transition** — once approved, invoke `meridian:execute` to implement.

## Key Principles

- **One question at a time** — don't overwhelm with multiple questions
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
