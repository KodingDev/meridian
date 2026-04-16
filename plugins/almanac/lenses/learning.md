---
name: learning
description: Observational note about concepts the user accepted without pushback in their sessions — tied back to the session moment, written up as reference prose with live citations.
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

The third query is the dissent pass: find limitations, footguns, or "don't use this" arguments. You need 2–3 canonical results plus 1 dissent result per concept, all from this run's `WebSearch` calls. Do not invent links.

## Step 3: Write the note

This is a learning review written FOR the user, not AS them. You are an observer describing what concepts showed up in the sessions and what's actually worth knowing about them. Narrate from outside the user's head.

For each concept, write a few paragraphs mixing two voices:

- **Second-person observational** for the session tie-back: "this came up on Tuesday around 11:47 while you were refactoring `BinkDecoder` — you accepted the `[LibraryImport]` attribute without pushback when the assistant swapped the whole interop layer to source-generated P/Invoke."
- **Direct reference voice** for the concept itself: "`[LibraryImport]` is a source generator that emits marshalling stubs at compile time, shipped in .NET 7 and matured in 8/9. It makes the code NativeAOT-compatible because..." — authoritative, citations inline as prose links, no hedging, no "I think."

Weave the dissent link in as honest engagement, not a footnote: "The dissent worth knowing is [issue #75052](https://...) — a mechanical `[DllImport]` → `[LibraryImport]` migration can silently change string-marshalling semantics and crash at runtime. In your case that matters because..."

### Voice

- **Second-person observational for the session context.** "This came up while you were working on X," "you accepted the assistant's suggestion of Y without pushback at 11:47," "the decision got made quickly enough that Z wasn't interrogated."
- **Direct reference voice for the concept itself.** Authoritative statements. "`Lazy<T>` with `LazyThreadSafetyMode.ExecutionAndPublication` runs the initializer under a lock, which..." Not "I think `Lazy<T>` might..." and not "you should learn that..." Just the facts, cited inline.
- **Never impersonate the user.** Do NOT write in first person as if you are the user. No "I accepted this without thinking," no "I should have pushed back," no "I want to remember next time." If a sentence starts with "I" outside a quotation mark of the user's actual words, you are impersonating — rewrite it.
- **Tie each concept to the specific session moment it came up.** What was being built, what was being decided, what got accepted on autopilot. The concept is interesting because of the session moment, not in the abstract.
- **Engage the dissent in prose, take a position on whether it applies.** "The dissent worries about X — in your case that matters because Y" or "The dissent worries about X — but in your case it doesn't apply because Y." Observational, not a question back to the user.

### Integrity

- 2–3 canonical links per concept plus 1 dissent link, all from this run's `WebSearch` results. No invented links. No training-data citations.
- Inline as prose: `the [runtime team's docs](https://...) describe this as` — never a References section at the end.

### Forbidden — template fingerprints AND impersonation fingerprints

Section headers that must NOT appear:

- `## Concepts to own`
- `## References` (as a section listing URLs grouped by concept)
- `## Study plan`
- `## Socratic prompts`

Shapes and phrasings that must NOT appear:

- A numbered list of concepts with bolded names and one-sentence descriptions
- A `Read: ... / Build: ... / Re-examine: ...` plan
- Self-quiz questions at the end ("Why did X need Y?", "How would you design Z?")
- **First-person narration as the user**: "I accepted this without thinking," "the part I should have pushed back on," "I want to remember next time," "the thing that surprised me"
- Claims about the user's inner state or future intentions
- The word "Concepts" as a section heading
- A closing summary or tidy conclusion

If you reach for any of these, rewrite in second-person observational + reference voice.

### Permitted, encouraged

- One `## <concept name>` heading per concept if it helps organize, or a single flowing piece if the concepts are tangled — your call based on the material
- Going long on the concept that mattered most, short on the one that was a papercut
- Linking concepts to each other when they actually interact in the session
- Sentence fragments, em-dashes, mid-thought pivots — in the reference prose, not in fake first-person

### Length

Whatever the material asks for. Three concepts that all matter might run 1200 words. Five concepts that were small might run 500. Don't pad to hit a structure.

Redaction of secrets is handled by `reflect` after you finish; do not self-redact.

## History summary — INPUT DATA

{{history-summary}}
