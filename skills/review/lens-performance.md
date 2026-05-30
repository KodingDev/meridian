# Lens: Performance & Architecture

Review the diff against the dimensions below. This lens checks whether the change scales and is well-structured.

## Efficiency
- Unnecessary work: redundant computations, repeated file reads, duplicate network/API calls, N+1 patterns
- Missed concurrency: independent operations run sequentially when they could run in parallel
- Hot-path bloat: new blocking work added to startup or per-request / per-render hot paths
- Recurring no-op updates: state/store updates inside polling loops, intervals, or event handlers that fire unconditionally — add a change-detection guard so downstream consumers aren't notified when nothing changed. Also: if a wrapper function takes an updater/reducer callback, verify it honors same-reference returns (or whatever the "no change" signal is) — otherwise callers' early-return no-ops are silently defeated
- Unnecessary existence checks: pre-checking file/resource existence before operating (TOCTOU anti-pattern) — operate directly and handle the error
- Memory: unbounded data structures, missing cleanup, event listener leaks
- Overly broad operations: reading entire files when only a portion is needed, loading all items when filtering for one

## Rendering Performance
- Unnecessary re-renders
- Missing Suspense / lazy for heavy components
- Unoptimized images
- Large bundle imports that could be dynamic

## Framework Anti-Patterns
- Effects for anything other than external sync (data transforms, event handling = wrong)
- Refs where state belongs (refs for non-JSX values only)
- Missing or incorrect dependency arrays
- Inline object/array/function creation causing re-renders
- Components over 150 lines (suspicious), over 250 (defect)
- Props drilling through more than 2 levels when composition or context is cleaner
- useState for derived values

## API Design
- Exported functions missing doc comments (internal helpers don't need them)
- Doc comments that just restate the signature
- Non-generic API design (raw types where a generic works)
- Inconsistent function signatures in the same module
- Boolean flag params that should be separate functions or options
