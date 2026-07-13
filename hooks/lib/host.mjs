// Host detection and every host-coupled behavior: where config lives and the shape
// of the stdout payload. Detected once per process.

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** @typedef {import("./types.mjs").Host} Host */
/** @typedef {import("./types.mjs").HostName} HostName */

/**
 * Resolve the state base in priority order, short-circuiting so `existsSync`
 * only runs once the env vars miss.
 * @param {HostName} name
 * @returns {string}
 */
function resolveStateBase(name) {
  const claude = join(homedir(), ".claude");
  const cursor = join(homedir(), ".cursor");
  const copilot = process.env.COPILOT_HOME || join(homedir(), ".copilot");
  const codex = process.env.CODEX_HOME || join(homedir(), ".codex");
  // Copilot and Codex both set CLAUDE_PLUGIN_ROOT (as a compat alias), so their
  // branches must precede that fallback or they'd resolve to ~/.claude.
  const candidates = [
    () => process.env.CLAUDE_CONFIG_DIR,
    () => name === "cursor" && cursor,
    () => name === "copilot" && copilot,
    () => name === "codex" && codex,
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
 * on `SessionStart` (via `additional_context`); Copilot sets `COPILOT_PLUGIN_ROOT`
 * and injects on `SessionStart` only (via flat `additionalContext`); Codex and
 * Claude use `hookSpecificOutput`.
 * Copilot and Codex also set `CLAUDE_PLUGIN_ROOT` (compat), so both must be checked
 * before the Claude default. Codex ships no unique identity var, so the un-prefixed
 * `PLUGIN_ROOT` — which Codex sets but Claude does not — is the documented
 * discriminator; a misdetect only picks the wrong state dir, since Codex and Claude
 * share the `hookSpecificOutput` emit shape.
 * @returns {Host}
 */
export function detectHost() {
  /** @type {HostName} */
  const name = process.env.CURSOR_PLUGIN_ROOT
    ? "cursor"
    : process.env.COPILOT_PLUGIN_ROOT
      ? "copilot"
      : process.env.PLUGIN_ROOT
        ? "codex"
        : "claude";
  return {
    name,
    stateBase: resolveStateBase(name),
    emit: (text) => {
      if (name === "cursor") {
        process.stdout.write(JSON.stringify({ additional_context: text }) + "\n");
        return;
      }
      if (name === "copilot") {
        process.stdout.write(JSON.stringify({ additionalContext: text }) + "\n");
        return;
      }
      /** @type {{ hookSpecificOutput: { hookEventName: string; additionalContext: string } }} */
      const payload = {
        hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: text },
      };
      process.stdout.write(JSON.stringify(payload) + "\n");
    },
  };
}
