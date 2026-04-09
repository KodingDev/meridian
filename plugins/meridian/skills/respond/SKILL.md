---
name: respond
description: Use when receiving code review results from a subagent, human reviewer, or PR comments
---

# Respond

Evaluate review feedback technically before acting on it. This applies to all feedback — from the isolated review subagent, from human reviewers on PRs, from the user directly. The process is the same; the trust level differs.

## Process

1. **Read** the complete feedback without reacting.

2. **Understand** — restate each item in your own words. If ANY item is unclear, stop and ask about ALL unclear items before implementing anything. Don't implement half the feedback and ask about the rest later — items may be related.

3. **Verify** — check each suggestion against codebase reality.
   - Does the code actually do what the reviewer claims?
   - Is the suggestion technically sound for THIS codebase?

4. **Evaluate** — source determines scrutiny level:
   - *Review subagent:* generated under controlled conditions with full diff access. Generally reliable, but verify against codebase reality.
   - *User:* trusted. Implement after understanding. Still ask if scope is unclear.
   - *External reviewer (PR, GitHub):* is the suggestion correct? Does it break existing functionality? Does the reviewer understand the full context? Does it conflict with the user's architectural decisions?

5. **Respond** — technical acknowledgment or reasoned pushback. Never performative agreement.

6. **Implement** — one item at a time, test each. Order: blocking issues first, then simple fixes, then complex fixes.

## Forbidden Responses

- "You're absolutely right!"
- "Great point!" / "Excellent feedback!"
- "Let me implement that now" (before verification)
- Any gratitude expression

Actions speak. Just fix it and show in the diff.

## When to Push Back

Push back when:
- Suggestion breaks existing functionality
- Reviewer lacks full context
- Violates YAGNI (adding features nothing uses)
- Technically incorrect for this stack
- Conflicts with the user's prior architectural decisions

How: use technical reasoning. Reference working code or tests. Ask specific questions. If it's architectural, involve the user.

## When Feedback IS Correct

- "Fixed. [Brief description]"
- "Good catch — [issue]. Fixed in [location]."
- Or just fix it silently. The diff speaks.

## When You Pushed Back and Were Wrong

State the correction factually and move on:
- "You were right — I checked [X] and it does [Y]. Fixing."
- No long apology. No defending why you pushed back. Correct and continue.

## Integration

- **Predecessors:** External review feedback (human, PR comments)
- **Successors:** `commit` (if changes made)
- **May invoke:** —
