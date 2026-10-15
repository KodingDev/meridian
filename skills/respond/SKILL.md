---
name: respond
description: Evaluate and address concrete code-review feedback against repository reality.
---

# Respond

User intent, priorities, and accepted tradeoffs are authoritative. Technical explanations and proposed fixes remain claims to verify against the code and evidence.

## Process

1. Read all feedback and its surrounding diff context.
2. Separate requested outcomes from technical assertions about the cause or solution.
3. Verify each technical assertion against repository behavior, tests, and relevant documentation.
4. Apply correct in-scope fixes one at a time with focused verification.
5. Push back concisely when a suggestion is technically wrong, breaks existing behavior, conflicts with an accepted decision, or expands scope without value.
6. Report what changed, what was declined, and the evidence supporting either result.

## Automated reviewers

Review bots and automated security reviews find real defects. They also file non-issues and restate style preferences as defects. Treat each finding as a claim:

- **Fix** when you can trace a realistic path from a real caller or input to the failure, and the fix costs less than what it prevents.
- **Dismiss** when the path is impossible or far-fetched, or the fix adds more code than it protects. Reply with the path you traced and the reason.
- **Ask** when the finding is about security or data exposure and you would dismiss it. The user decides.

A bot's severity label is not evidence. Repeated findings on the same area mean the shape of the code is wrong; fix the cause, not each finding.

Avoid performative agreement, but ordinary human acknowledgment is fine. If your earlier technical conclusion was wrong, correct it directly without defensive explanation.
