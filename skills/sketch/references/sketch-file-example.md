# Sketch File Example

A complete sketch file, for reference. The format is fixed-order: H1 title, then
Context → Plan → User Constraints (omit if none) → Done When.

```markdown
# Add Copy Button to Code Blocks

## Context
Code blocks in the docs lack a copy-to-clipboard button, forcing manual selection. Add a button in the top-right corner of each block.

## Plan
- Add `CopyButton` component to `src/components/docs/CopyButton.tsx`
- Wire it into `src/components/docs/CodeBlock.tsx` (top-right absolute positioning)
- Use existing `clipboard.writeText` util from `src/utils/clipboard.ts`

## User Constraints
- Match existing icon button styling (no custom variant)

## Done When
- Button appears on all code blocks
- Clicking copies the block contents
- Visual state confirms the copy (icon swap for ~1.5s)
```

If no User Constraints were stated, omit that heading entirely; the file goes Context → Plan → Done When.
