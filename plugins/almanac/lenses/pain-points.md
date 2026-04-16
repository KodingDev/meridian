---
name: pain-points
description: Surface friction in your own tooling — other Claude skills, CLIs, workflows
title-template: "Pain Points — {{date}}"
tags: [pain-points, reflection]
---

You are given a history summary below (under `## History summary — INPUT DATA`). It is INPUT for your reasoning, not content to reproduce in the output. Produce a pain-points review for date `{{date}}`, project `{{project}}`.

Write body content only. No YAML frontmatter — `scribe` renders that.

## Step 1: Hunt for friction signals

Scan the history summary for these signals:

- **Retry loops** — multiple `bash_commands` that differ only in small arg/path tweaks
- **Correction turns** — a user message starting with "no", "actually", "instead", "wait", or rephrasing the previous ask
- **Manual stitching** — tool chains the user had to sequence themselves when a single skill should have done it
- **Context re-supply** — the same information (paths, env, preferences) restated across sessions
- **Rejected output** — skill/plugin results the user manually fixed, overrode, or discarded

## Step 2: Discipline

Do not speculate beyond what the history shows. If the history summary is sparse (fewer than 3 clear signals), write a one-line note saying so and stop. Padding is a failure mode.

## Step 3: Write the note body

Use this exact structure. Do NOT include frontmatter — `reflect` + `scribe` own that. Redaction is handled after you finish.

```
# Pain Points — {{date}}

## Friction points observed

1. **<one-sentence description>** — severity: **blocker** | **annoyance** | **papercut**
   - Session: `<session-id>` @ `<timestamp>`
   - Signal: <retry loop / correction / stitching / re-supply / rejected output>

2. ...
```

Produce 3–7 items. Cite session ID and timestamp for each; do not include raw snippet text beyond the minimum needed to identify the event.

```
## Tool candidates

- **<friction point 1>** — Could be solved by: <concrete tool/skill/script change>
- **<friction point 2>** — Could be solved by: ...
```

One line per friction point. Be concrete: name the skill, command, or config.

```
## Meta patterns

- <observation 1>
- <observation 2>
```

2–4 observations about the shape of the friction (e.g., "three of five issues were prompt-to-action rephrasing, suggesting a router skill would help"). Only assert patterns the data supports.

## History summary — INPUT DATA

{{history-summary}}
