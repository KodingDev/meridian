// Host detection and every host-coupled behavior: where state lives, whether an
// event injects context, and the shape of the stdout payload. Detected once per
// process; nothing outside this module branches on the host.

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {import("./types.mjs").Host} Host */
/** @typedef {import("./types.mjs").HostName} HostName */

const CONTEXT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "context");

/**
 * Resolve the state base in priority order, short-circuiting so `existsSync`
 * only runs once the env vars miss.
 * @param {HostName} name
 * @returns {string}
 */
function resolveStateBase(name) {
  const claude = join(homedir(), ".claude");
  const cursor = join(homedir(), ".cursor");
  const candidates = [
    () => process.env.CLAUDE_CONFIG_DIR,
    () => name === "cursor" && cursor,
    () => process.env.CLAUDE_PLUGIN_ROOT && claude,
    () => existsSync(claude) && claude,
    () => existsSync(cursor) && cursor,
  ];
  for (const candidate of candidates) {
    const hit = candidate();
    if (hit) return hit;
  }
  return claude;
}

/**
 * Detect the host once. Cursor sets `CURSOR_PLUGIN_ROOT` and injects context only
 * on `SessionStart` (via `additional_context`); Claude injects on every event
 * (via `hookSpecificOutput`).
 * @returns {Host}
 */
export function detectHost() {
  /** @type {HostName} */
  const name = process.env.CURSOR_PLUGIN_ROOT ? "cursor" : "claude";
  return {
    name,
    stateBase: resolveStateBase(name),
    supportsContext: (event) => (name === "cursor" ? event === "SessionStart" : true),
    emit: (event, text) => {
      if (name === "cursor") {
        if (event === "SessionStart") {
          process.stdout.write(JSON.stringify({ additional_context: text }) + "\n");
        }
        return;
      }
      /** @type {{ hookSpecificOutput: { hookEventName: string; additionalContext: string } }} */
      const payload = { hookSpecificOutput: { hookEventName: event, additionalContext: text } };
      process.stdout.write(JSON.stringify(payload) + "\n");
    },
  };
}

/**
 * Inject a `context/<filename>` file via the host. No-op when the host doesn't
 * inject for this event or the file is missing.
 * @param {Host} host
 * @param {import("./types.mjs").HookEvent} event
 * @param {string} filename
 */
export function emitContextFile(host, event, filename) {
  if (!host.supportsContext(event)) return;
  let text;
  try {
    text = readFileSync(join(CONTEXT_DIR, filename), "utf8");
  } catch {
    return;
  }
  host.emit(event, text.trimEnd());
}
