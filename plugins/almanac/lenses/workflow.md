---
name: workflow
description: Flag workflow improvements based on wasted steps, retries, or rework
title-template: "Workflow Review — {{date}}"
tags: [workflow, reflection]
---

You are given a history summary below (under `## History summary — INPUT DATA`). It is INPUT for your reasoning, not content to reproduce in the output. Produce a workflow review for date `{{date}}`, project `{{project}}`.

Write body content only. No YAML frontmatter — `scribe` renders that.

## Step 1: Quantify

Count the following from the history summary:

- **Retries** — repeated commands with minor variation (same binary, differing args)
- **Rework cycles** — files edited, reverted, then re-edited
- **Long waits** — gaps >5 min between user and assistant turns with no tool activity (use timestamps)
- **Context re-supply** — events where the user restated info already present in an earlier session
- **Sessions ended mid-task** — sessions whose last turn is an unresolved tool call or open question

## Step 2: Write the note body

Use this exact structure. No frontmatter blocks. Redaction is handled after you finish.

```
# Workflow Review — {{date}}

## Metrics

| Signal                    | Count | Notes |
|---------------------------|-------|-------|
| Retries                   | <N>   | <short note> |
| Rework cycles             | <N>   | <short note> |
| Long waits (>5min)        | <N>   | <short note> |
| Context re-supply events  | <N>   | <short note> |
| Sessions ended mid-task   | <N>   | <short note> |
```

If every row is 0 or near-0, replace the "Top 3" / "Quick wins" / "Structural questions" sections with a single line: `No workflow friction in this window.` and stop.

Otherwise continue:

```
## Top 3 workflow costs

1. **<what happened>**
   - Frequency: <count or rate>
   - Estimated time cost: <minutes per occurrence × occurrences>
   - Fix: <proposed change>

2. ...

3. ...

## Quick wins

- <small change: keybind / alias / CLAUDE.md note / new skill invocation>
- <small change>

## Structural questions

- <question the data cannot answer>
- <question the data cannot answer>
```

Quick wins must be immediately actionable — name the file to edit, alias to add, or skill to invoke. Structural questions must be things you genuinely cannot resolve from the history alone (e.g., "Is the dev server restart loop a tooling issue or a project-structure issue?").

## History summary — INPUT DATA

{{history-summary}}
