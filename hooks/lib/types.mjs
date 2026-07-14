// JSDoc typedefs for the hook contract. No runtime code — other modules
// reference these via `import("./types.mjs").<Name>`.

/**
 * The JSON payload Claude Code / Cursor delivers to a hook on stdin. Every field
 * is optional; different events populate different subsets.
 * @typedef {Object} HookInput
 * @property {string} [model] Active model identifier when supplied by the host.
 * @property {string} [model_id] Cursor's preferred active model identifier when supplied.
 * @property {string} [tool_name] PreToolUse: the tool about to run (e.g. "Bash").
 * @property {{ command?: string }} [tool_input] PreToolUse: the tool's arguments.
 * @property {string} [hook_event_name]
 */

/** @typedef {"claude" | "cursor" | "copilot" | "codex"} HostName */

/**
 * A resolved host — the single place the Claude/Cursor/Copilot differences live.
 * @typedef {Object} Host
 * @property {HostName} name
 * @property {string} stateBase Base dir under which Meridian host configuration is kept.
 * @property {(text: string) => void} emit Writes the host's SessionStart context payload to stdout.
 */

export {};
