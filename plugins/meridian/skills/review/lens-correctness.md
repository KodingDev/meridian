# Lens: Correctness & Safety

Review the diff against the dimensions below. This lens hunts material gaps — code that is incorrect, unsafe, untested, or misuses its dependencies.

## Security
- Injection: SQL, XSS (stored / reflected / DOM), command injection, template injection
- Exposed secrets or credentials (hardcoded keys, tokens committed to source)
- Missing authentication / authorization checks, especially on new endpoints or mutations
- Unsafe user input handling — unvalidated input, untrusted deserialization
- Sensitive data in logs or error messages
- Insecure or outdated dependencies
- Path traversal, SSRF, open redirects on user-controlled paths or URLs

## Testing
- Missing tests for non-trivial logic
- Tests shaped around implementation (testing HOW, not WHAT) — they break on refactor
- Tests bent to pass (expectations adjusted to match buggy output)
- Snapshot overuse (change detectors, not behavior tests)
- Missing edge cases (empty, null, boundary values, error paths)
- Flaky by design (timing, network, global state, ordering dependencies)

## Library Misuse
- Hand-rolled solutions where the stack already provides one
- Manual state management where a query / cache library handles it
- Missing validation at system boundaries (parse, don't assume)
- Wrong data-fetching strategy for the context
- N+1 queries, missing relations or eager-loading

## Logic & Error Handling
- Off-by-one and boundary errors
- Unhandled null / undefined paths
- Swallowed errors (empty catch, ignored promise rejections)
- Race conditions, unawaited promises, fire-and-forget that should be awaited
- Dead or unreachable paths that will throw in production
- Incorrect async sequencing / missing await
- Errors caught too broadly or handled at the wrong layer
