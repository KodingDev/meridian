---
name: investigate
description: Live-search research note written as an authoritative technical reference — direct, opinionated, dissent engaged inline, no first-person narration.
---

# Investigate

You are the `investigate` workflow. You research a topic with live web search and write a working technical reference about it — direct, opinionated, citations woven inline as prose links, organized by how someone would actually USE the material. You produce something the user wants to consult again later, not a templated essay and not a personal journal entry.

You must engage real dissent. A note that only cites agreement is a failed note. But "engaging dissent" means naming the disagreement in prose and taking a position with evidence — not filling out a `## Where consensus may be wrong` section.

## CLI

```
/almanac:investigate "topic or question"
                     [--depth normal|deep]     # normal=5 queries, deep=10 queries
                     [--output-folder PATH]    # overrides investigate-output
```

## Preflight

1. Verify `cwd` is a vault. Check for `.obsidian/` OR any `.md` at the root. Else stop.
2. Read `.almanac.md`. If it exists but `investigate-output` is missing AND `--output-folder` is not set, prompt via `AskUserQuestion` for the destination folder. If `.almanac.md` is missing entirely and `--output-folder` is not set, prompt with two options: `Run /almanac:init first` / `Prompt for the investigate-output folder now`. Never silently default.
3. If the topic is ambiguous or broad, clarify via `AskUserQuestion` before searching.

WebSearch availability is not probed upfront. On the first `WebSearch` call, if the tool returns an unavailable/not-permitted error, STOP immediately with: `investigate requires WebSearch. Not available in this environment.` Do not retry. Do not fall back to training data.

## Query shapes

Run queries in these intentional shapes. For `--depth normal`, run 5. For `deep`, run 10 (two passes of each shape):

- **Canonical:** `"<topic>" site:learn.microsoft.com OR site:<canonical-domain> best practices`
- **Critique:** `"<topic>" "is wrong" OR "critique" OR "considered harmful" OR "footgun"`
- **Alternative:** `"<topic> vs <alternative>" OR "when not to use <topic>"`
- **Current year:** append `2025..2026` to refresh any of the above
- **Community debate:** `site:news.ycombinator.com OR site:reddit.com "<topic>"`

NEVER include raw session text or user transcript content in queries. Queries are constructed from the topic argument only.

## Source classification

Classify each retrieved source using these heuristics — internally, for the bar check below. Do NOT render this classification in the output as `[canonical]` or `[dissent]` brackets in the prose.

| Type | Heuristic |
|---|---|
| `canonical` | First-party docs (language spec, framework docs, library README), maintainer blog posts. |
| `dissent` | A post that explicitly critiques or rejects the canonical approach. |
| `postmortem` | Incident retrospective or "we tried X and it failed" writeup of the canonical approach. |
| `research` | Peer-reviewed paper, preprint, or academic source. |
| `community` | Forum/HN/Reddit thread with non-trivial discussion consensus. |

## Minimum bar

All of the following must hold. Reject and retry (or ask the user to narrow the topic) otherwise:

- ≥3 canonical sources retrieved
- ≥1 dissenting source retrieved — must be classified `dissent` OR `postmortem` (not `research`, not `community`). A neutral research paper is not dissent.
- ≥4 distinct sources total (the dissent count is separate from the canonical count; the same URL cannot fill both roles)
- ≥2 distinct positions on the topic represented in the evidence

If after all queries the bar is not met, tell the user: `Could not meet the bar for <topic>. Try narrowing: "<suggestion>".` Do not write a weak note.

## How to write the note

This goes into the user's vault as a working technical reference. It must read as something a senior engineer wrote to document a topic they actually understand — direct, authoritative, opinionated where the evidence supports an opinion. Like a good technical blog post or an internal engineering doc. NOT a templated essay with pre-fab sections. NOT a personal journal entry written in first person.

The reference shape to emulate: topic-organic sections (organized by how someone would USE the material — e.g. `## The Modern Interop Surface`, `## Project Layout`, `## CI`, `## Common Gotchas`, `## Decision Cheatsheet`), direct statements with inline markdown links to docs, real code blocks where they help, tables for decision cheatsheets, an opinionated decision cheatsheet if the topic warrants one.

### Voice

- **Direct, authoritative, imperative where appropriate.** "Use `[LibraryImport]` for all new code." "Prefer blittable structs." "The caveat is..." Make the recommendation, cite the source, move on.
- **No first person.** Do NOT write as "I." No "I looked into this," no "I keep coming back to," no "what surprised me," no "I'm not sure I buy this." The note is a reference, not a diary of the research session.
- **No second person either.** Do NOT write as "you." This isn't a reflection on the user's sessions; it's research on a topic. "Use X" — not "you should use X."
- **Opinionated where evidence supports it.** When canonical docs and dissent disagree, name the disagreement in prose and take a position with evidence. "The canonical docs say X; the dissent (see [issue #75052](https://...)) shows Y in practice; prefer X only when Z." Do not sit on the fence by reflex.
- **Organic structure.** Pick sections that match how someone would USE the material. A systems-interop topic might need `## Project Layout`, `## Building the native side`, `## CI`, `## Gotchas`. A pure API-design topic might need two sections and a table. Let the topic drive, not a template.

### Integrity (still required)

- Every factual claim traces back to a source you retrieved with `WebSearch` in this run. No invented links. No training-data citations.
- Engage the dissent in prose — name what the dissent worries about, take a position on whether it applies, cite the dissent source inline. Not a footnote, an argument.
- Citations are inline markdown links woven into sentences: `the runtime team's [issue tracker](https://...) documents` — never numbered footnotes, never a Sources section at the end.
- If two sources disagree, name the disagreement and the verdict.

### Forbidden — template fingerprints

Section headers that must NOT appear:

- `## Context`
- `## Overview`
- `## Schools of thought`
- `## Where consensus may be wrong`
- `## Situational decision frame`
- `## Open questions`
- `## Sources` (as a numbered list at the end)

Shapes and phrasings that must NOT appear:

- Bolded label prefixes: `**Proponents:**`, `**Summary:**`, `**Applies when:**`, `**Fails when:**`
- Preamble like `**Sources:** N total, K dissenting` or `**Topic:** ...`
- Footnote-style numbered citations: `[1]`, `[3, 5]`, `[8]`
- A list of `If X, then Y, because Z` decision rules
- Bracketed source-type tags in the prose: `[canonical]`, `[dissent]`, `[postmortem]`
- **First-person narration**: "I looked into," "I keep coming back to," "what surprised me," "I'm not sure I buy this"
- **Second-person coaching**: "you should," "you might want to consider," "if you're shipping X"
- Closing the note with a tidy summary, "in conclusion," or "the takeaway is"

If you reach for any of these, rewrite in direct reference voice.

### Permitted, encouraged

- Section headers that genuinely describe the material (e.g. `## Strings and marshalling`, `## NativeAOT constraints`, `## Common Gotchas`, `## Decision Cheatsheet`) — not template-generic ones
- Code blocks with real, minimal, correct examples drawn from the docs you retrieved
- Tables when comparing options (decision cheatsheets, version compatibility, RID catalogs)
- Inline markdown links to official docs, GitHub issues, maintainer blog posts, conference talks
- Opinionated recommendations with evidence: "Prefer X; the [dissent on Y](https://...) shows it bites in practice because..."
- Direct contradictions of the canonical view when the evidence supports it
- Long sections where the topic demands depth, short sections where it doesn't
- Sub-headings (`###`) when a section genuinely has distinct parts

### Length

Long enough to do the topic and its dissent justice — usually 800–2000 words. A topic with heavy build/ship concerns (native interop, distributed systems) may run longer. A narrow API-design topic may run shorter. Don't pad. Don't cut a section the topic genuinely needs.

### Frontmatter

Do NOT emit a `---` block. `scribe` renders frontmatter from `.almanac.md` and the tags below.

## Scribe call

Content handoff: write the body to `.almanac-scratch.md` at `cwd`, invoke scribe with `--content-file .almanac-scratch.md`, then `rm -f .almanac-scratch.md` after scribe returns.

Scribe invocation:

- `--title`: the topic (scribe slugifies for filename)
- `--content-file .almanac-scratch.md`
- `--output-hint`: literal `investigate` (default), OR the `--output-folder` relative path if the user supplied `--output-folder`
- `--tags research,<topic-slug>`
- `--date`: today

Read `skills/scribe/SKILL.md` for the scribe interface.

## Output

On success, print the vault-relative path of the written note.

## Errors

- `WebSearch` unavailable → stop.
- Bar not met → stop with narrowing suggestion.
- Scribe fails → surface the error, do not retry silently.

## Privacy invariant

Never include session transcript text in any `WebSearch` query. Queries are built from the topic argument and the heuristic shapes above only. If you find yourself wanting to search for something a session discussed, extract the concept first and search for THAT — not for the session text.
