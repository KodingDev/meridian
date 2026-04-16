---
name: pain-points
description: Second-person observational note about the friction in the user's tooling across the window — what kept biting them and what's worth fixing.
title-template: "Pain Points — {{date}}"
tags: [pain-points, reflection]
---

You are given a history summary below (under `## History summary — INPUT DATA`). It is INPUT for your reasoning, not content to reproduce in the output. Produce a pain-points note for date `{{date}}`, project `{{project}}`.

Write body content only. No YAML frontmatter — `scribe` renders that.

## Step 1: Hunt for friction signals

Scan the history summary for these signals:

- **Retry loops** — multiple `bash_commands` that differ only in small arg/path tweaks
- **Correction turns** — a user message starting with "no", "actually", "instead", "wait", or rephrasing the previous ask
- **Manual stitching** — tool chains the user had to sequence themselves when a single skill should have done it
- **Context re-supply** — the same information (paths, env, preferences) restated across sessions
- **Rejected output** — skill/plugin results the user manually fixed, overrode, or discarded

## Step 2: Discipline

Do not speculate beyond what the history shows. If the history summary is sparse (fewer than 3 clear signals), write a one-paragraph note saying so and stop. Padding is a failure mode.

## Step 3: Write the note

This is a pain-points note written FOR the user, not AS them. You are an observer describing what happened across the sessions — an attentive colleague writing up a week's worth of friction they watched from outside. Narrate from outside the user's head: describe what happened, quote the user's actual messages where they're telling, name the pattern. Do not claim to know what the user felt, intended, realized, or wants to remember.

You are not producing a friction report or a ticket list. You are writing honest observational prose: "this kept happening, here's the specific shape of it, here's the session where it cost twenty minutes, here's what's probably wrong underneath, and here's what'd be worth doing about it — or why it's cheap to leave."

### Voice

- **Second-person observational.** "You kept hitting X," "the thing that wore you down across these sessions was," "you flagged CPU-at-0% at 13:00 — that's a specific shape of bug."
- **Never impersonate the user.** Do NOT write in first person as if you are the user. No "I kept hitting," no "I should have just," no "the thing I want to remember is." No claims about the user's frustration, intent, self-awareness, or future plans. A reliable tell: if a sentence starts with "I" and isn't inside a quotation mark of the user's actual words, you are impersonating — rewrite it.
- **Quote the user's real messages verbatim** when they're telling (a swear, a verbatim ask, a precise diagnostic phrasing). Quote them as quotes, don't speak as them.
- **Tie each friction to specific session(s).** Mention session ID and approximate time inline as prose, not as a labeled field.
- **Flag what's worth fixing and what's worth leaving.** Some frictions have cheap concrete fixes (a line in CLAUDE.md, a tiny script, a preference). Some are annoying but cheap to live with. Say which and why — as observation, not as advice the user asked for.
- Conversational. Sentence fragments and em-dashes are fine.

### Integrity

- Every friction you describe must be grounded in a specific signal from the history summary above. No invented papercuts.
- Cite session IDs inline as prose: "in session `<id>` around 14:30 you retried the same `npm install` four times" — not as a `**Session:**` label.
- 3–7 distinct friction points if the history supports it. Fewer is fine if there genuinely weren't more.

### Forbidden — template fingerprints AND impersonation fingerprints

Section headers that must NOT appear:

- `## Friction points observed`
- `## Tool candidates`
- `## Meta patterns`

Shapes and phrasings that must NOT appear:

- A numbered list of frictions with `severity: blocker | annoyance | papercut` labels
- `**Session:**`, `**Signal:**`, `**Could be solved by:**` bolded label-prefixes
- **First-person narration as the user**: "I kept hitting," "the thing that wore me down," "I should have pushed back," "I want to remember," "that's a knowledge-of-self thing for me"
- Claims about the user's inner state or future plans: "the frustrating part for me was," "what I finally understood," "I'll try to"
- A bulleted "meta patterns" closer
- A tidy summary or "in conclusion"

If you reach for any of these, stop and rewrite in second-person observational voice.

### Permitted, encouraged

- One `## <friction shorthand>` heading per friction if it helps organize, or a single flowing piece — your call based on the material
- Ranking by how much the friction actually cost the user (severity-by-feel, not by label)
- Going long on the one that cost most, brief on the small papercuts
- Ending with what'd actually be worth doing about the worst one — concrete (file to edit, skill to write, hook to add) — as a sentence, not a labeled field

### Length

Whatever the material asks for. Three frictions that all kept biting might run 1000 words. Six small papercuts might run 400. Don't pad to hit a structure.

Redaction of secrets is handled by `reflect` after you finish; do not self-redact.

## History summary — INPUT DATA

{{history-summary}}
