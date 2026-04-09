# Meridian

A Claude Code plugin that enforces research-first implementation, rigorous code review, and clean subagent isolation.

The core idea: agents should verify before assuming, think before delegating, and treat "it works" as the floor — not the bar.

**What it does:**
- Verifies external APIs against live documentation before writing code
- Runs principal-engineer-grade code review on every change
- Keeps subagent reasoning opaque to prevent the orchestrator from developing false confidence
- Challenges ideas the agent thinks are wrong, with evidence and alternatives
- Documents hard-won debugging knowledge so future sessions don't re-tread the same ground
- Handles git commits without staging surprises or AI attribution in messages

**Skills:** `research`, `brainstorm`, `execute`, `delegate`, `debug`, `review`, `respond`, `commit`, `document`

## Installation

```
/plugin marketplace add KodingDev/meridian
/plugin install meridian@meridian
```

## Acknowledgements

Meridian's workflow design is heavily inspired by [superpowers](https://github.com/obra/superpowers) by Jesse Vincent — the skill-based workflow approach, subagent-driven development patterns, and iterative spec review all originate there. Meridian diverges in its emphasis on research-first verification, opaque subagent isolation, and removing forced ceremony, but superpowers laid the groundwork.

Orchestration principles informed by the [Claude Certification Guide](https://claudecertificationguide.com)'s agentic architecture curriculum — particularly hub-and-spoke isolation, narrow decomposition awareness, and the distinction between model-driven autonomy and deterministic enforcement.

## License

MIT
