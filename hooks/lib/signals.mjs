// Input acquisition plus the pure decision logic. `sessionId`, `isFailureSignal`,
// and `auditDue` take plain values and return plain values — directly unit-tested
// in test/meridian-lib.test.mjs without spawning a hook.

import { readFileSync } from "node:fs";

/** @typedef {import("./types.mjs").HookInput} HookInput */

const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_SIGNAL_LENGTH = 40;

// Terse failure replies that, mid-work, are a `debug` signal — a bug to root-cause,
// not a cue to keep patching. Anchored to the WHOLE (short) message: an elaborated
// report like "no, the real issue is X…" must NOT match — substring matching would
// be the false-positive footgun. Restricted to the "still …" / "doesn't work" /
// "not fixed" family, which presupposes a failed fix, so it stays correct even when
// the message doubles as an answer. Bare "no"/"nope" are excluded as too ambiguous.
const FAILURE_SIGNAL =
  /^(still (broken|wrong|the same|not working|not fixed|not right|broke|bad|off|happening|failing|borked)|still doesn'?t work|does(n'?t| not) work( still)?|not fixed|that'?s still (wrong|broken|not fixed)|nope,? still (broken|wrong|the same))$/;

/**
 * Read and parse the hook payload from stdin. Returns `{}` on empty/invalid input
 * so a malformed payload degrades to a no-op instead of crashing the session.
 * @returns {HookInput}
 */
export function readInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}

/**
 * The filesystem-safe session id (`session_id`, Copilot's `sessionId`, or Cursor's
 * `conversation_id`). Returns null for anything outside a single `[A-Za-z0-9_-]`
 * path segment, which blocks separators, "..", and shell metacharacters before any
 * fs use.
 * @param {HookInput} input
 * @returns {string | null}
 */
export function sessionId(input) {
  const id = input?.session_id ?? input?.sessionId ?? input?.conversation_id;
  return typeof id === "string" && ID_PATTERN.test(id) ? id : null;
}

/**
 * True when a prompt is a terse "the fix didn't land" reply — a `debug` signal
 * rather than a cue to keep patching.
 * @param {unknown} prompt
 * @returns {boolean}
 */
export function isFailureSignal(prompt) {
  if (typeof prompt !== "string") return false;
  const trimmed = prompt.trim();
  if (!trimmed || trimmed.length > MAX_SIGNAL_LENGTH) return false;
  // Collapse internal whitespace so an accidental double-space ("still  broken") still matches.
  const normalized = trimmed
    .toLowerCase()
    .replace(/[\s.!?:;,~]+$/, "")
    .replace(/\s+/g, " ");
  return FAILURE_SIGNAL.test(normalized);
}

/**
 * True on every `every`-th prompt — the periodic routing-audit cadence.
 * @param {number} count
 * @param {number} every
 * @returns {boolean}
 */
export function auditDue(count, every) {
  return count > 0 && count % every === 0;
}
