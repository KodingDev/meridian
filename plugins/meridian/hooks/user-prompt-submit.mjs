#!/usr/bin/env node
import { mkdirSync, utimesSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readHookInput, safeSessionId, sessionDir, emitContextFile, isCursorHost } from "./lib.mjs";

const AUDIT_EVERY = 8;

// Terse failure replies that, mid-work, are a `debug` signal — a bug to root-cause,
// not a cue to keep patching. Anchored to the WHOLE (short) message: an elaborated
// report like "no, the real issue is X…" must NOT match. Substring matching here
// would be the false-positive footgun. The set is restricted to the "still …" /
// "doesn't work" / "not fixed" family, which inherently presupposes a failed fix —
// so it stays correct even when the message doubles as an answer to a question.
// Bare "no"/"nope" are deliberately excluded as too ambiguous to gate on.
const FAILURE_SIGNAL =
  /^(still (broken|wrong|the same|not working|not fixed|not right|broke|bad|off|happening|failing|borked)|still doesn'?t work|does(n'?t| not) work( still)?|not fixed|that'?s still (wrong|broken|not fixed)|nope,? still (broken|wrong|the same))$/;

/**
 * @param {unknown} prompt
 * @returns {boolean}
 */
function isFailureSignal(prompt) {
  if (typeof prompt !== "string") return false;
  const trimmed = prompt.trim();
  if (!trimmed || trimmed.length > 40) return false;
  const normalized = trimmed.toLowerCase().replace(/[\s.!?:;,~]+$/, "");
  return FAILURE_SIGNAL.test(normalized);
}

const input = readHookInput();
const sessionId = safeSessionId(input);
if (!sessionId) process.exit(0);

const dir = sessionDir(sessionId);
const tickFile = join(dir, "router-tick");

mkdirSync(dir, { recursive: true });
try {
  utimesSync(dir, new Date(), new Date());
} catch {
  // Best-effort; a failed touch only risks an early prune of an idle session.
}

// Cursor beforeSubmitPrompt has no context injection; tick/audit/reroute are Claude-only.
if (isCursorHost()) process.exit(0);

let tick = 0;
try {
  const raw = readFileSync(tickFile, "utf8").trim();
  if (/^\d+$/.test(raw)) tick = parseInt(raw, 10);
} catch {
  // No tick file yet, or unreadable -- start from 0.
}
tick += 1;
try {
  writeFileSync(tickFile, tick + "\n");
} catch {
  // A failed write just replays this tick next prompt.
}

// A terse failure reply mid-work means the last fix didn't land. Nudge toward
// root-cause before more patching — this beats the periodic audit on this turn.
if (isFailureSignal(input.prompt)) {
  emitContextFile("UserPromptSubmit", "debug-reroute.md");
  process.exit(0);
}

if (tick % AUDIT_EVERY === 0) {
  emitContextFile("UserPromptSubmit", "routing-audit.md");
}
