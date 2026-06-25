---
name: meridian
description: Use when starting any conversation or when unsure which skill applies
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill entirely.
</SUBAGENT-STOP>

# Meridian

Research-first workflows, orchestrator-led reasoning, and ruthless quality standards. The three pillars, Challenge Protocol, subagent context hygiene, question-asking rules, and local-artifact conventions live in the active output style (always in context) — this skill is the full routing reference behind the session orientation.

## Routing

Assess each user request and route to the appropriate skill. Not every request needs a skill — use judgment.

| Signal | Skill | Examples |
|--------|-------|----------|
| Small, well-scoped fix — single subsystem, ≤3 files, no new behavior | `sketch` | "change the X label to Y", "add a copy button to Z", "fix the hover state on W" |
| New feature, significant change, anything spanning multiple subsystems, requiring data model changes, or where scope is unclear | `brainstorm` | "build X", "add a feature that...", "redesign the..." |
| Bug report, test failure, unexpected behavior, **pasted screenshot of UI not matching intent** | `debug` | "this is broken", "getting an error", pasted stack traces, "why is X happening", screenshots with "still wrong" / "still the same" / "doesn't work" / "still broken" |
| Touches external API/lib, unfamiliar pattern | `research` | "how does X API work", "check if Y supports...", unfamiliar imports |
| After completing work, quality check | `review` | "review this", "is this ready to merge" |
| Receiving feedback from reviewer or PR | `respond` | "here's the PR feedback", reviewer comments pasted |
| Ready to commit or push | `commit` | "commit", "commit and push", "save this" |
| After complex work, capturing knowledge | `document` | "document this", "write up what we learned" |
| Has an approved spec to implement | `execute` | "implement this", "go build it", after spec approval |
| Multiple independent tasks | `delegate` | "do these in parallel", 2+ unrelated tasks at once |
| Simple question, trivial change | Just do it | "what does this function do?", "rename X to Y" |

**Do not force ceremony where none is needed.** The table covers the common cases. For borderline calls, prefer `brainstorm` if the change requires more than 1-2 sentences to describe or touches more than one subsystem.

### Mid-flow re-routing

A user message arriving during an active skill (especially `execute` or `sketch`) is not automatically a continuation of that skill. Re-classify each new message against the routing table.

The dominant miss: a screenshot — or a terse failure reply ("still wrong", "still the same", "still broken", "not fixed", "doesn't work", "nope"), *including* one-word or image-only messages — arriving during `execute` is a `debug` signal, not a "keep executing" signal. The terseness is the tell: a fix just shipped and the short dismissal means it didn't land. Symptom-poking inside `execute` is the failure mode this rule prevents — `execute` patches, `debug` finds the cause. STOP the patch loop the moment you see it — do not emit another speculative fix in the same turn. Pause `execute`, route to `debug`, complete root-cause investigation; once `debug` produces a fix, return to `execute`. A UserPromptSubmit hook reinforces the unambiguous "still …" / "not fixed" phrasings, but you own the call on screenshots and one-word rejections the hook can't safely match.

This applies whether the original routing was `execute`, `sketch`, or any other active skill. Visual regressions are bugs even when they appeared one step ago in the same session.

### Modifier: `/auto`

`/meridian:auto` runs the wrapped task in autonomous mode, and the same principles auto-activate on a stepping-away signal in prose ("going to shower", "see you in an hour", "be autonomous"). The wrapped task still routes through this table normally; `/auto` only changes *how* the active skill runs. See the `auto` skill for the full principles and signal list.

## Specialist Lenses

Lens skills are **domain-shaped**, not activity-shaped. Where activity skills (`brainstorm`, `execute`, `debug`, `sketch`) describe *what you're doing*, lens skills describe *what shape of claim you're making and how to verify it*. Lenses compose with active skills — they don't replace them, and they fire on their own trigger signals regardless of which activity skill is active. New lenses earn their place by surfacing in retrospective failure analysis, not by speculative addition.

| Lens | Triggers (orchestrator self-check) | Format-as-gate |
|------|----------|----------------|
| `triangulate` | specific-value claim where the source-of-truth artifact wasn't read this session — covers binary/protocol/API behavior, CSS tokens & theme values, computed runtime values (oklch, contrast, sizes), config/dependency fields, observable UI state, and "what's in this file/function" claims; code edit + confidence-escalation in same response; "code does X so output Y" reasoning without reading an output artifact; spec authoring against an unread config/theme/token file; user-correction immediately followed by a re-claim | **Tier 1 (default):** read the artifact inline before asserting — no audit file. **Tier 2 (contested/load-bearing only):** Ground Truth Audit row inline in the active spec/sketch + full file at `.meridian/audits/`. See the `triangulate` skill. |

## Integration

- **Predecessors:** None — entry point
- **Successors:** Any skill via routing
- **May invoke:** —
