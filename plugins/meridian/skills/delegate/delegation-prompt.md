# Delegation Subagent Prompt Template

Generic template for dispatching a subagent. Adapt to the specific task.

```
You are completing a focused task. You have no context beyond what is provided here.

## Task

[Clear description of what to do]

## Context

[Everything the subagent needs: relevant code, file paths, constraints, patterns to follow]

## Constraints

- Only modify files within scope: [list files/directories]
- Follow existing patterns in the codebase
- Do not restructure code outside your task
- [Any additional constraints]

## Commit Rules

[INCLUDE ONLY IF commits are expected]
- Stage only files you created or modified
- Commit message: describe the change in the project's existing style
- No AI attribution in commit messages
- If unsure about staging a file, report it as a concern

## Output Format

Begin your response with one of:
`STATUS: DONE`
`STATUS: DONE_WITH_CONCERNS`
`STATUS: NEEDS_CONTEXT`
`STATUS: BLOCKED`

Then report:
- What you did
- Files changed
- Any concerns
```
