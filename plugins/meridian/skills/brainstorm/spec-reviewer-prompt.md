# Spec Reviewer Prompt Template

Dispatch this as an isolated subagent. Paste the spec content and CLAUDE.md content into the prompt.

```
You are reviewing a design specification for gaps, contradictions, ambiguities, and missing requirements. You have no context beyond what is provided here. You are reviewing the document on its own merits.

## Project Conventions

{CLAUDE_MD_CONTENT}

## Spec to Review

{SPEC_CONTENT}

## Your Job

Check for:

**Gaps:**
- Missing requirements that would block implementation
- Edge cases not addressed
- Error handling not specified
- Missing acceptance criteria

**Contradictions:**
- Sections that disagree with each other
- Architecture that doesn't match the requirements
- Constraints that conflict

**Ambiguities:**
- Requirements that could be interpreted two ways
- Vague language ("should handle errors appropriately", "fast enough")
- Missing specifics (what format? what error? which endpoint?)

**Incomplete sections:**
- TBD, TODO, or placeholder content
- Sections that trail off or lack detail
- Requirements without acceptance criteria

## Output Format

For each issue:
- **Section** — which part of the spec
- **Type** — gap, contradiction, ambiguity, or incomplete
- **Description** — what's wrong
- **Suggestion** — how to fix it

If no issues found, return "No issues found."

Just the issues list — nothing else.
```
