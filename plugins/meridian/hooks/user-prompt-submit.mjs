#!/usr/bin/env node
import { mkdirSync, utimesSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readHookInput, safeSessionId, sessionDir, emitContextFile } from "./lib.mjs";

const AUDIT_EVERY = 8;

const sessionId = safeSessionId(readHookInput());
if (!sessionId) process.exit(0);

const dir = sessionDir(sessionId);
const tickFile = join(dir, "router-tick");

mkdirSync(dir, { recursive: true });
// Bump dir mtime on every prompt so SessionStart's prune reflects last-activity.
try {
  utimesSync(dir, new Date(), new Date());
} catch {
  // Best-effort; a failed touch only risks an early prune of an idle session.
}

let tick = 0;
try {
  const raw = readFileSync(tickFile, "utf8").trim();
  if (/^\d+$/.test(raw)) tick = parseInt(raw, 10);
} catch {
  // No tick file yet, or unreadable -- start from 0; a lost tick only delays the audit.
}
tick += 1;
try {
  writeFileSync(tickFile, tick + "\n");
} catch {
  // A failed write just replays this tick next prompt; never block submission.
}

// Every Nth prompt, emit a discreet routing audit so the model re-checks that
// the active skill still matches intent. Absorbed silently as additionalContext.
if (tick % AUDIT_EVERY === 0) {
  emitContextFile("UserPromptSubmit", "routing-audit.md");
}
