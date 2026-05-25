#!/usr/bin/env node
import { mkdirSync, utimesSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readHookInput, safeSessionId, sessionDir, emitContext } from "./lib.mjs";

const AUDIT_EVERY = 8;
const here = dirname(fileURLToPath(import.meta.url));

const sessionId = safeSessionId(readHookInput());
if (!sessionId) process.exit(0);

const dir = sessionDir(sessionId);
const tickFile = join(dir, "router-tick");

mkdirSync(dir, { recursive: true });
// Bump dir mtime on every prompt so SessionStart's prune reflects last-activity.
const now = new Date();
try {
  utimesSync(dir, now, now);
} catch {}

let tick = 0;
try {
  const raw = readFileSync(tickFile, "utf8").trim();
  if (/^\d+$/.test(raw)) tick = parseInt(raw, 10);
} catch {}
tick += 1;
try {
  writeFileSync(tickFile, tick + "\n");
} catch {}

// Every Nth prompt, emit a discreet routing audit so the model re-checks that
// the active skill still matches intent. Absorbed silently as additionalContext.
if (tick % AUDIT_EVERY === 0) {
  try {
    const audit = readFileSync(join(here, "context", "routing-audit.md"), "utf8");
    emitContext("UserPromptSubmit", audit.trimEnd());
  } catch {}
}
