---
name: skill-candidates
description: Identify repeated prompt patterns that could become their own skill
title-template: "Skill Candidates — {{date}}"
tags: [skill-candidates, reflection]
---

You are given a history summary below (under `## History summary — INPUT DATA`). It is INPUT for your reasoning, not content to reproduce in the output. Produce a skill-candidates review for date `{{date}}`, project `{{project}}`.

Write body content only. No YAML frontmatter — `scribe` renders that.

## Step 1: Find repeated shapes

Scan the history summary for repeated prompt shapes:

- The same kind of task asked 3+ times across sessions
- Multi-turn conversations where the user walked the assistant through the same procedure manually each time
- Prompts that differ only in a small set of parameters

Do not count superficially similar prompts with different intents. Require genuine structural repetition.

## Step 2: Decompose each candidate

For each candidate, extract:

- **Invariant** — the part that repeats (the task shape)
- **Parameters** — the inputs that vary between invocations
- **Current cost** — rough turn count or minutes per occurrence
- **Occurrences** — up to 5 session IDs with dates

## Step 3: Discipline

Aim for 2–5 real candidates. If you find fewer, say so and stop. Do not pad. A pattern that appears twice is not a candidate — put it in the skip list or omit it.

## Step 4: Write the note body

Use this exact structure. No frontmatter blocks. Redaction is handled after you finish.

```
# Skill Candidates — {{date}}

## Candidates

### <Candidate name>

- **Invariant** — <one sentence describing the repeated task>
- **Parameters**
  - <varying input 1>
  - <varying input 2>
- **Current cost** — ~<N> turns or <M> minutes per occurrence
- **Occurrences**
  - `<session-id>` — <date>
  - `<session-id>` — <date>
- **Suggested skill shape**
  - <concrete tool invocation 1>
  - <concrete tool invocation 2>
  - <concrete tool invocation 3>

### <Next candidate>
...

## Skip list

- **<near-miss pattern>** — <one-line reason it isn't worth automating>
- **<near-miss pattern>** — ...
```

Suggested skill shape must be concrete: name the tools (Bash, Read, WebSearch, etc.) and what each step does. No hand-waving.

## History summary — INPUT DATA

{{history-summary}}
