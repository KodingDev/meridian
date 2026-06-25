# Lens: Craft & Simplicity

Review the diff against the dimensions below. This lens checks whether the change is the cleanest, most reusable expression of its intent. Be ambitious — prefer restructurings that delete whole categories of complexity over local cleanup; the best fix often makes the code feel inevitable in hindsight.

Ask of every change:
- Is there a "code judo" move — a reframing on the existing architecture that makes this dramatically simpler, not just tidier?
- Could fewer concepts, branches, or layers carry the same behavior?

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
- Magic over direct: a generic or clever mechanism hiding a simple data-shape assumption — prefer the boring, direct implementation

## Quality Patterns
- Redundant state: duplicates existing state, cached values that could be derived, observers/effects that could be direct calls
- Parameter sprawl: adding parameters to a function instead of generalizing or restructuring
- Copy-paste with slight variation: near-duplicate blocks that should be unified with a shared abstraction
- Leaky abstractions: exposing internals that should be encapsulated, or breaking existing abstraction boundaries
- Stringly-typed code: raw strings where constants, enums (string unions), or branded types already exist
- Wrong-layer placement: feature-specific logic leaking into general-purpose or shared modules, or logic added where a canonical module already owns the concept
- File-size smell: a change that grows a file past ~1k lines without decomposition — extract modules or helpers first
- Type-boundary churn: cast-heavy or optionality-laden code where one explicit typed contract would be clearer — indirection that obscures the real shape
- Spaghetti growth: a new conditional bolted into an unrelated flow, or a condition chain branching on the same discriminant — push it behind a dedicated abstraction or typed dispatcher rather than tangling the existing path
- Cohesion erosion: a previously focused module becoming more coupled, more stateful, or harder to scan
- "Temporary" branching or flags likely to harden into permanent debt

## AI Slop
Comments are the highest-signal tell. Judge every comment **added in the diff** by value, not by count — a comment earns its place only when it captures non-obvious *why* (a hidden constraint, a subtle invariant, a workaround for a specific bug). The code already states the *what*. Flag the rest for removal:
- Reasoning narrated as comments — walking through the plan or restating what the code is about to do (`// first build the map, then filter`); this is chain-of-thought that leaked into the file
- Comments restating the next line, the function name, or a self-evident signature in English
- Decorative section dividers (`// ── Section ──`)
- Changelog comments (git history exists)
- Apology comments (`// Hack: ...`, `// TODO: refactor`)
- Multi-paragraph docstrings or comment blocks where one line of *why* would do

Then the non-comment slop:
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
