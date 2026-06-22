---
name: sketch
description: Use for a small, well-scoped fix where the user can describe the change in 1-2 sentences and wants it done with the same rigor as a full spec
argument-hint: "[optional description of the fix]"
---

<HARD-GATE>
Do NOT invoke `execute` until the user has approved the sketch.
</HARD-GATE>

# Sketch

A lightweight spec for small fixes. The spec is lighter than `brainstorm`'s; the `execute` → `review` quality gate is identical.

## When to Use

Primarily user-invoked via `/meridian:sketch [optional description]`. Auto-invocation by the meridian router is rare and conservative — only fires for clearly-small fixes per the routing table. Do NOT auto-invoke if any Escape Hatch trigger applies. Unfamiliar external APIs alone are not a disqualifier — they trigger `meridian:research` at step 2.

## Process

1. **Targeted context.** Locate and read the file(s) the Plan will modify — typically 1-2. Read-only references (types, callers) don't count toward the 3-file ceiling. If more than 3 files will be modified, escape to `brainstorm`.

   Also consult the auto-memory system (`MEMORY.md` is already in context). Read any `feedback` or `user` memories that apply to this fix; persistent rules ("test before claiming done", "no AI slop comments", "always use existing utils") get pre-populated into User Constraints rather than waiting for the user to restate them. If a memory is stale relative to the code, trust the code and update or remove the memory.

2. **Identify research needs.** "Unfamiliar" means: imports a library not in the immediate file, or uses an API not verified in this session. If unfamiliar, invoke `meridian:research`. After it returns, re-evaluate scope: if research surfaced unexpected complexity, escape to `brainstorm`; otherwise resume.

3. **Clarify if needed.** Use `AskUserQuestion` for any genuine ambiguity — including proposing a slug if `/meridian:sketch` was invoked with no description. Capture stated constraints (`do/don't` rules) for the User Constraints section. Skip if the request is unambiguous.

4. **Write the sketch file.** Path: `.meridian/sketches/YYYY-MM-DD-<slug>.md` (date in local time). Slug: lowercase, ASCII-fold, replace non-alphanumerics with hyphens, collapse, trim, truncate to 60 chars, re-trim. If the result is empty, propose a slug at step 3. On filename collision, append `-2`, `-3`. Create the directory if missing. Do NOT commit. Do NOT stage.

   Format: H1 `# <Title-cased argument>`, then sections in fixed order — **Context** (1-2 sentences), **Plan** (bulleted: file changes or imperative steps, both forms allowed), **User Constraints** (omit the heading entirely if none), **Done When** (acceptance bullets). See `references/sketch-file-example.md` for a complete annotated example.

5. **Self-review.** Placeholder scan (no TBD/TODO/incomplete bullets), internal consistency (Plan covers Done When; Done When is verifiable), ambiguity check. Fix inline.

6. **Present and approve.** Show the sketch contents. Ask via `AskUserQuestion` with options "Approve" / "Request changes". On "Request changes": collect changes, update file in place, re-run self-review, re-present. After 3 unsuccessful rounds, suggest transitioning to `brainstorm`. If a User Constraint surfaces during this step, it counts as a "Request changes" event — update the file and re-present, never silently mutate.

7. **Hand off.** On approval, invoke `meridian:execute` via the `Skill` tool. Reference the sketch file's absolute path in the preceding message so `execute` can locate it.

## Post-handoff Constraints

After handoff to `execute`, the sketch file is still the contract — and so the sketch's "constraints surface = re-present" rule (step 6) keeps applying. When a User Constraint surfaces during execution ("only 2 lines", "no blur effects", "match the existing pattern exactly", "use my dev server, not yours"), treat it as a sketch event, not just an execute note:

1. Pause the active execute task at the next safe checkpoint (don't abandon a half-edited file mid-write)
2. Append the new rule to the sketch's User Constraints section
3. Re-present the updated sketch — showing what changed — for re-approval via the same `AskUserQuestion` "Approve" / "Request changes" gate as step 6
4. On re-approval, resume execute with the updated constraint propagated to any in-flight subagent

Silent absorption — quietly adding the constraint to a future subagent prompt without re-presenting — is the failure mode this exists to prevent. A small fix that has accumulated three new constraints mid-execute is no longer the small fix the user approved; the sketch needs to reflect that, and the user needs to see what the running contract is now.

If a constraint round suggests the original 1-2 sentence framing has been outgrown — multiple subsystems implicated, data shapes shifting, scope drifting toward a feature — surface that and escape to `brainstorm` per the rule below. The threshold is shape, not count.

## Escape Hatch

Stop and transition to `brainstorm` if mid-flow you discover:
- The change spans multiple subsystems
- The change requires data-model changes (persisted schemas, types shared across modules, migrations)
- The change requires modifying more than 3 files
- Research returns blockers or significant unknowns
- The user adds requirements that exceed the original 1-2 sentence framing

On escape: if the sketch file is untracked by git, delete it; otherwise leave it and warn the user. Pass any captured User Constraints into the `brainstorm` invocation message, then invoke `brainstorm` via the `Skill` tool.

## Integration

- **Predecessors:** `meridian` routing, or direct invocation
- **Successors:** `execute`
- **May invoke:** `research`, `brainstorm` (escape hatch)