---
name: research
description: Verify unstable or unfamiliar external API and library contracts that materially affect the task.
argument-hint: "[query or topic to research]"
---

# Research

Use current primary sources when implementation depends on external behavior that may have changed or is not established in the available artifacts.

## Discipline

1. State the narrow question and the version or environment that matters.
2. Prefer official documentation, source code, standards, release notes, or direct runtime evidence.
3. Verify load-bearing details such as signatures, defaults, compatibility, and failure behavior. Do not pad the search with unrelated background.
4. Use a research subagent only when parallel reading or context isolation is materially useful; direct research is valid.
5. Return the answer in your own words with links or artifact paths close to the claims they support.
6. If the evidence is incomplete or conflicting, say what remains uncertain and whether it blocks the task.

Training knowledge can guide where to look, but it is not evidence for time-sensitive external behavior.
