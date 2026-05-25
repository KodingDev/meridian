// Shared helpers for Meridian's hooks. Written in Node (invoked via exec form in
// hooks.json) so the hooks behave identically on macOS, Linux, and Windows
// without depending on bash version, BSD-vs-GNU sed/awk, jq, or shell quoting.

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Read the hook event payload from stdin. Returns {} on empty or invalid input
// so a malformed payload degrades to a no-op instead of crashing the session.
export function readHookInput() {
  let raw = "";
  try {
    raw = readFileSync(0, "utf8");
  } catch {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// session_id flows into rm -rf / mkdir paths, so accept only the UUID-shaped
// values Claude Code actually issues. Anything else (or a missing/non-string
// value) returns null and the caller treats the session as absent.
export function safeSessionId(input) {
  const id = input?.session_id;
  return typeof id === "string" && /^[A-Za-z0-9_-]+$/.test(id) ? id : null;
}

export function stateRoot() {
  const base = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
  return join(base, "meridian", "state");
}

export function sessionDir(sessionId) {
  return join(stateRoot(), sessionId);
}

// Emit additionalContext as a JSON object on stdout. JSON.stringify handles all
// escaping, replacing the hand-rolled sed/awk encoder that silently corrupted
// content under BSD sed on macOS.
export function emitContext(hookEventName, text) {
  const payload = { hookSpecificOutput: { hookEventName, additionalContext: text } };
  process.stdout.write(JSON.stringify(payload) + "\n");
}
