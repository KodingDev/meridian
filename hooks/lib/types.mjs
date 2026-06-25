// JSDoc typedefs for the hook contract. No runtime code — other modules
// reference these via `import("./types.mjs").<Name>`.

/**
 * The JSON payload Claude Code / Cursor delivers to a hook on stdin. Every field
 * is optional; different events populate different subsets.
 * @typedef {Object} HookInput
 * @property {string} [session_id] Claude session id (SessionStart / SessionEnd / UserPromptSubmit).
 * @property {string} [conversation_id] Cursor's equivalent id.
 * @property {string} [sessionId] Copilot's equivalent id (native camelCase payload).
 * @property {string} [prompt] UserPromptSubmit: the submitted prompt text.
 * @property {string} [tool_name] PreToolUse: the tool about to run (e.g. "Bash").
 * @property {{ command?: string }} [tool_input] PreToolUse: the tool's arguments.
 * @property {string} [hook_event_name]
 */

/** @typedef {"claude" | "cursor" | "copilot"} HostName */

/** The hook events that can inject context. @typedef {"SessionStart" | "UserPromptSubmit"} HookEvent */

/**
 * A resolved host — the single place the Claude/Cursor/Copilot differences live.
 * @typedef {Object} Host
 * @property {HostName} name
 * @property {string} stateBase Base dir under which Meridian session state is kept.
 * @property {(event: HookEvent) => boolean} supportsContext Whether this host injects context for the event.
 * @property {(event: HookEvent, text: string) => void} emit Writes the host's context-injection payload to stdout.
 */

export {};
