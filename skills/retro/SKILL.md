---
name: retro
description: Review a finished session, branch, or pull request for friction, and turn each lesson into the strongest durable fix.
disable-model-invocation: true
argument-hint: "[session, branch, PR, or time range]"
---

# Retro

Find what made the work slower or worse than it had to be, and fix the cause where the next session will meet it. The output is a short list of changes to checks, instructions, and skills. It is not a diary.

Invocation authorizes a report-only retro. Apply the proposed changes only when the user asks.

## Scope

Review what the user names: this session, a branch, a pull request, or a time range. If nothing is named, review this session and the branch it worked on.

## Process

1. **Collect the evidence.** Read the session's corrections and redirections from the user, the commits and their diff, review comments, CI failures, and reverted or rewritten work. Each finding cites one of these.
2. **List the friction.** A finding is a place where work was redone, a user corrected the agent, a reviewer caught a defect, a check failed late, or effort went into a path that was abandoned. Skip friction that came from a one-off fact no rule could have supplied.
3. **Name the cause.** For each finding, pick one:
   - a missing check that would have caught it;
   - a project instruction that is missing, wrong, or ignored;
   - a skill rule that is missing, wrong, or conflicts with another;
   - a tool or environment gap;
   - a gap in the agent's own judgment that no durable change addresses.
4. **Choose the strongest fix.** Prefer, in order:
   1. a check that fails: a lint rule, a test, a type, a hook, or a script;
   2. a deleted or rewritten instruction, when an existing instruction caused the friction;
   3. one new line in project instructions;
   4. a change to a skill.
   A lesson that already exists as text and was still missed needs a check, not more text. A finding with no durable fix is reported and dropped.
5. **Report.** Lead with the proposed changes, strongest first. For each, give the evidence, the cause, the exact file and change, and what it prevents. Then list the findings you dropped and why, in one line each.

## Rules

- Propose no more changes than the evidence supports. Three precise changes beat ten vague ones.
- A proposed instruction is one imperative sentence that a model can follow without the session's context.
- Session narrative stays in chat. Changes to the repository describe the rule, never the session that produced it.
- When a skill from outside this repository caused the friction, name the skill and the line, and propose the change to the user. Do not edit an installed copy.
