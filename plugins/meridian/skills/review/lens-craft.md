# Lens: Craft & Simplicity

Review the diff against the dimensions below. This lens checks whether the change is the cleanest, most reusable expression of its intent.

## Code Reuse
For each change, search for existing utilities and helpers that could replace newly written code — common locations are utility directories, shared modules, and files adjacent to the changed ones.
- New function that duplicates existing functionality — suggest the existing function instead
- Inline logic that could use an existing utility: hand-rolled string manipulation, manual path handling, custom environment checks, ad-hoc type guards
- Reimplementing a standard-library or framework primitive

## Simplification
- Code that can be deleted entirely
- Abstractions serving one call site (inline them)
- Utility functions for one-time operations (delete them)
- Premature configurability (YAGNI)
- Nested ternaries (extract to early returns or lookups)
- Wrapper components or functions adding nothing

## Quality Patterns
- Redundant state: duplicates existing state, cached values that could be derived, observers/effects that could be direct calls
- Parameter sprawl: adding parameters to a function instead of generalizing or restructuring
- Copy-paste with slight variation: near-duplicate blocks that should be unified with a shared abstraction
- Leaky abstractions: exposing internals that should be encapsulated, or breaking existing abstraction boundaries
- Stringly-typed code: raw strings where constants, enums (string unions), or branded types already exist

## AI Slop
- Decorative section dividers (// ── Section ──)
- Comments restating the next line in English
- Changelog comments (git history exists)
- Apology comments (// Hack: ..., // TODO: refactor)
- Gratuitous intermediate variables
- Defensive code for impossible cases
- Empty else blocks, exhaustive switches with identical arms

## Code Style & Conventions
Enforce the project's rules from CLAUDE.md / config. Every violation is a defect. Check types vs interfaces, `any` usage, component typing patterns, formatting, lint-disable syntax, import ordering, Tailwind patterns — whatever the project specifies.

## Naming
- Names that lie about content
- Generic names (data, result, item, info, handler)
- Booleans that don't read as questions (use is/has/should/can)
- Function names that don't describe what they do
