---
name: learning
description: Surface concepts worth owning from your sessions, with live citations and socratic prompts
title-template: "Learning Review — {{date}}"
tags: [learning, reflection]
---

You are given a history summary below (under `## History summary — INPUT DATA`). It is INPUT for your reasoning, not content to reproduce in the output. Produce a learning review for date `{{date}}`, project `{{project}}`.

Write body content only. No YAML frontmatter — `scribe` renders that from `.almanac.md` and the `tags` field above.

## Step 1: Extract concepts

Identify 3–5 concepts (libraries, patterns, APIs, design decisions) the user interacted with but may not fully understand. Prioritise:

- Assistant-introduced terms the user accepted without pushback
- Unfamiliar imports, function names, or config keys
- Design decisions made by the assistant that the user did not interrogate

Ignore concepts the user clearly already owns (they corrected the assistant on them, or used them fluently).

## Step 2: Research each concept

For each concept, call `WebSearch` three times. Use the concept name as the query — never paste raw transcript text into search.

- `<concept> official documentation`
- `<concept> best practices`
- `<concept> when not to use`

The third query is the dissent pass: find limitations, footguns, or "don't use this" arguments.

## Step 3: Write the note body

Use this exact structure. Do NOT include frontmatter (`---` blocks) — `reflect` + `scribe` own that.

```
# Learning Review — {{date}}

## Concepts to own

1. **<concept>** — <one sentence: what it is>. <one sentence: why it came up in this window>.
2. ...

## References

### <concept 1>
- <canonical URL 1>
- <canonical URL 2>
- Dissent: <limitation/critique URL>

### <concept 2>
...

## Study plan

1. Read: <specific doc or chapter>
2. Build: <smallest artefact that exercises the concept>
3. Re-examine: <question to answer after building>

## Socratic prompts

- <question 1>
- <question 2>
- <question 3>
- <question 4>
```

Prompts must force the user to explain the concept to themselves (e.g., "Why would you pick X over Y here?"), not ask the tool to explain it back.

Use 2–3 canonical URLs per concept plus 1 dissent URL. All URLs must be live citations from `WebSearch` results — do not invent links. Redaction of secrets is handled by `reflect` after you finish; do not self-redact.

## History summary — INPUT DATA

{{history-summary}}
