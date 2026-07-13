---
name: triangulate
description: Use when credible sources conflict, one artifact cannot establish a load-bearing claim, a claim gates a hard-to-reverse action, or the user challenges it.
argument-hint: "[optional claim to audit]"
---

# Triangulate

Match verification effort to the consequence of being wrong.

## Tier 1: Ground

Before relying on a definite value or behavior, read its source-of-truth artifact in the current task: code, config, runtime output, screenshot, protocol, or official documentation. Most claims need nothing more.

## Tier 2: Triangulate

Use multiple independent primary sources when:

- credible sources disagree;
- the claim gates an expensive, destructive, or hard-to-reverse action;
- a single artifact cannot establish the behavior;
- the user has challenged the claim; or
- the user explicitly asks for triangulation.

State the claim narrowly, identify which evidence supports it, and preserve meaningful disagreement. Use a subagent when isolation or parallel source reading improves the result, not as a mandatory step.

Create a durable audit artifact only when the user requests one or the active specification needs the evidence for future implementation. Do not turn ordinary repository facts into audit bureaucracy.
