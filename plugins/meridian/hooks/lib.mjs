// Shared helpers for Meridian's hooks. Written in Node (invoked via exec form in
// hooks.json) so the hooks behave identically on macOS, Linux, and Windows
// without depending on bash version, BSD-vs-GNU sed/awk, jq, or shell quoting.

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CONTEXT_DIR = join(dirname(fileURLToPath(import.meta.url)), "context");

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

// Accept only a single path segment of [A-Za-z0-9_-]; this blocks separators,
// "..", and shell metacharacters before the value reaches the rm -rf / mkdir
// paths below. Returns null for a missing/non-string/unsafe id so the caller
// treats the session as absent. (Not a UUID check -- any such segment passes.)
export function safeSessionId(input) {
  const id = input?.session_id;
  return typeof id === "string" && /^[A-Za-z0-9_-]+$/.test(id) ? id : null;
}

// Root dir for all Meridian session state; honors CLAUDE_CONFIG_DIR, else
// ~/.claude. This is the directory rmSync(recursive) ultimately operates under.
export function stateRoot() {
  const base = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
  return join(base, "meridian", "state");
}

// State dir for one session. sessionId must come from safeSessionId.
export function sessionDir(sessionId) {
  return join(stateRoot(), sessionId);
}

// Emit additionalContext as a JSON object on stdout. JSON.stringify handles all
// escaping (and keeps the payload a single line), replacing the hand-rolled
// sed/awk encoder that silently corrupted content under BSD sed on macOS.
function emitContext(hookEventName, text) {
  const payload = { hookSpecificOutput: { hookEventName, additionalContext: text } };
  process.stdout.write(JSON.stringify(payload) + "\n");
}

// Read a prompt-text file from hooks/context/ and emit it as additionalContext.
// Resolved relative to this module so it works regardless of cwd; a missing file
// degrades to a no-op rather than crashing the hook.
export function emitContextFile(hookEventName, filename) {
  let text;
  try {
    text = readFileSync(join(CONTEXT_DIR, filename), "utf8");
  } catch {
    return;
  }
  emitContext(hookEventName, text.trimEnd());
}
