---
name: document
description: Use after completing features, resolving complex bugs, or when hard-won knowledge would otherwise be lost
argument-hint: "[what to document]"
---

# Document

Capture knowledge for humans. Not for AI, not for ceremony — for the person who maintains this code in six months.

## When to Use

- After completing a feature with non-obvious behavior
- After resolving a complex debugging session
- When the agent recognizes hard-won knowledge is about to be lost with the session
- When the user asks to document something

## What to Document and Where

### Feature Documentation

If the project has a `docs/` folder, use it. The spec file from brainstorm is a starting point, but it needs rewriting — specs are instructions for an agent, docs are explanations for a person.

Write for someone who will use or maintain this feature. What does it do, how does it work, what should they know.

### Debugging Knowledge / Gotchas

When a complex issue is resolved, especially one that took significant investigation:

- **What the problem was** and how it manifests
- **Why it happens** (root cause)
- **What the fix is** and why it works
- **What was already tried** and why it didn't work
- **Sources** consulted (URLs, GitHub issues, docs pages)

Place this close to the relevant code: inline comments for small gotchas, a dedicated doc for complex ones.

### "We Already Tried This" Notes

For complex ongoing work — like replicating engine-specific rendering in WebGL, or fighting a particularly tricky integration — maintain a living doc of approaches tried:

```markdown
## Approaches Tried
- **Gamma correction swap (sRGB -> linear)** — didn't work because [reason]. See [source].
- **Manual tone mapping curve** — partially worked but [limitation].
- **[What actually worked]** — works because [explanation]. Key insight: [the non-obvious thing].
```

This prevents future sessions from re-treading the same ground. If the agent's first instinct is "maybe it's the gamma correction" but that was already tried and documented — the doc catches it.

### Architecture Decisions

When a non-obvious choice is made, document why. Not a formal ADR — just a brief note:
- What was decided
- What the alternatives were
- Why this one was chosen

Lives in `docs/` or as a comment near the relevant code, depending on scope.

## Principles

- **Write for the person who joins in 6 months.** They don't have your session context. They don't know what you tried.
- **Use the project's existing docs folder and conventions.** Don't invent a new structure.
- **Inline comments for small things, dedicated docs for complex ones.** A one-liner "this must be called before X because Y" belongs in code. A multi-paragraph rendering pipeline explanation belongs in a doc file.
- **Link to sources.** If the fix came from a GitHub issue, a docs page, or a forum post — include the URL.
- **Keep it current.** If you're updating code that has associated docs, update the docs too.
- **Don't write documentation for the sake of documentation.** If the code is self-explanatory and there are no gotchas, there's nothing to document.
