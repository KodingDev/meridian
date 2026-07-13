---
name: sketch
description: Create and approve a lightweight implementation sketch for a small change.
disable-model-invocation: true
argument-hint: "[optional description of the fix]"
---

<HARD-GATE>
This flow produces an approved sketch. Do NOT implement it or invoke `meridian:execute`; the user owns the transition to implementation.
</HARD-GATE>

# Sketch

A lightweight spec for small fixes.

## When to Use

Use only when the user invokes it. Unfamiliar external APIs alone are not a disqualifier; they trigger `meridian:research` at step 2.

## Process

1. **Targeted context.** Locate and read the file(s) the Plan will modify — typically 1-2. Read-only references (types, callers) don't count toward the 3-file ceiling. If more than 3 files will be modified, escape to `brainstorm`.

   Also consult the auto-memory system (`MEMORY.md` is already in context). Read any `feedback` or `user` memories that apply to this fix; persistent rules ("test before claiming done", "no AI slop comments", "always use existing utils") get pre-populated into User Constraints rather than waiting for the user to restate them. If a memory is stale relative to the code, trust the code and update or remove the memory.

2. **Identify research needs.** "Unfamiliar" means: imports a library not in the immediate file, or uses an API not verified in this session. If unfamiliar, invoke `meridian:research`. After it returns, re-evaluate scope: if research surfaced unexpected complexity, escape to `brainstorm`; otherwise resume.

3. **Clarify if needed.** Use the host's structured question tool for genuine ambiguity, or ask in plain text and wait when that tool is unavailable. This includes proposing a slug if `/meridian:sketch` was invoked with no description. Capture stated constraints (`do/don't` rules) for the User Constraints section. Skip if the request is unambiguous.

4. **Write the sketch file.** Path: `.meridian/sketches/YYYY-MM-DD-<slug>.md` (date in local time). Slug: lowercase, ASCII-fold, replace non-alphanumerics with hyphens, collapse, trim, truncate to 60 chars, re-trim. If the result is empty, propose a slug at step 3. On filename collision, append `-2`, `-3`. Create the directory if missing. Do NOT commit. Do NOT stage.

   Format: H1 `# <Title-cased argument>`, then sections in fixed order — **Context** (1-2 sentences), **Plan** (bulleted: file changes or imperative steps, both forms allowed), **User Constraints** (omit the heading entirely if none), **Done When** (acceptance bullets). See `references/sketch-file-example.md` for a complete annotated example.

5. **Self-review.** Placeholder scan (no TBD/TODO/incomplete bullets), internal consistency (Plan covers Done When; Done When is verifiable), ambiguity check. Fix inline.

6. **Present and approve.** Show the sketch contents. Ask with options "Approve" / "Request changes" through the host's structured question tool, or in plain text when unavailable. On "Request changes": collect changes, update file in place, re-run self-review, re-present. After 3 unsuccessful rounds, suggest transitioning to `brainstorm`. If a User Constraint surfaces during this step, it counts as a "Request changes" event — update the file and re-present, never silently mutate.

7. **Hand off.** On approval, stop with the approved sketch and its absolute path. Tell the user they can invoke `meridian:execute` when they want implementation to begin. Do not invoke it on their behalf.

## Escape Hatch

Stop and transition to `brainstorm` if mid-flow you discover:
- The change spans multiple subsystems
- The change requires data-model changes (persisted schemas, types shared across modules, migrations)
- The change requires modifying more than 3 files
- Research returns blockers or significant unknowns
- The user adds requirements that exceed the original 1-2 sentence framing

On escape: if the sketch file is untracked by git, delete it; otherwise leave it and warn the user. Preserve any captured User Constraints and recommend that the user invoke `meridian:brainstorm`. Do not invoke it on their behalf.
