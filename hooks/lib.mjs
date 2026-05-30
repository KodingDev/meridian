// Shared helpers for Meridian's hooks. Written in Node (invoked via exec form in
// hooks.json) so the hooks behave identically on macOS, Linux, and Windows
// without depending on bash version, BSD-vs-GNU sed/awk, jq, or shell quoting.

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CONTEXT_DIR = join(dirname(fileURLToPath(import.meta.url)), "context");

/** @returns {boolean} */
export function isCursorHost() {
  return Boolean(process.env.CURSOR_PLUGIN_ROOT);
}

/**
 * Read the hook event payload from stdin. Returns {} on empty or invalid input
 * so a malformed payload degrades to a no-op instead of crashing the session.
 * @returns {Record<string, any>}
 */
export function readHookInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}

// Accept only a single path segment of [A-Za-z0-9_-]. sessionStart/sessionEnd
// send session_id; Cursor beforeSubmitPrompt sends conversation_id.
/**
 * @param {Record<string, any>} input
 * @returns {string | null}
 */
export function safeSessionId(input) {
  const id = input?.session_id ?? input?.conversation_id;
  return typeof id === "string" && /^[A-Za-z0-9_-]+$/.test(id) ? id : null;
}

// Root dir for Meridian session state. Host-aware: Cursor → ~/.cursor, Claude →
// CLAUDE_CONFIG_DIR or ~/.claude.
/** @returns {string} */
export function stateRoot() {
  const claude = join(homedir(), ".claude");
  const cursor = join(homedir(), ".cursor");
  // Priority-ordered candidates: the first that yields a path wins, else the
  // explicit `.claude` default. Listed as data so each branch is independently
  // readable and short-circuits — existsSync only runs once the env vars miss.
  const candidates = [
    () => process.env.CLAUDE_CONFIG_DIR,
    () => isCursorHost() && cursor,
    () => process.env.CLAUDE_PLUGIN_ROOT && claude,
    () => existsSync(claude) && claude,
    () => existsSync(cursor) && cursor,
  ];
  let base = claude;
  for (const candidate of candidates) {
    const hit = candidate();
    if (hit) {
      base = hit;
      break;
    }
  }
  return join(base, "meridian", "state");
}

/**
 * @param {string} sessionId
 * @returns {string}
 */
export function sessionDir(sessionId) {
  return join(stateRoot(), sessionId);
}

// Cursor sessionStart expects additional_context; Claude Code expects
// hookSpecificOutput. Emit only what the current host consumes — Claude reads
// both without deduplication if both are present.
/**
 * @param {string} hookEventName
 * @param {string} text
 */
function emitContext(hookEventName, text) {
  if (isCursorHost()) {
    if (hookEventName === "SessionStart") {
      process.stdout.write(JSON.stringify({ additional_context: text }) + "\n");
    }
    return;
  }
  /** @type {{ hookSpecificOutput: { hookEventName: string; additionalContext: string } }} */
  const payload = { hookSpecificOutput: { hookEventName, additionalContext: text } };
  process.stdout.write(JSON.stringify(payload) + "\n");
}

/**
 * @param {string} hookEventName
 * @param {string} filename
 */
export function emitContextFile(hookEventName, filename) {
  let text;
  try {
    text = readFileSync(join(CONTEXT_DIR, filename), "utf8");
  } catch {
    return;
  }
  emitContext(hookEventName, text.trimEnd());
}
