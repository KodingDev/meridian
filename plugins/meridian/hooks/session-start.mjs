#!/usr/bin/env node
import { readdirSync, statSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readHookInput, safeSessionId, stateRoot, emitContext } from "./lib.mjs";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const here = dirname(fileURLToPath(import.meta.url));

const currentSession = safeSessionId(readHookInput());

// Prune session-state dirs untouched for 7+ days. user-prompt-submit bumps each
// dir's mtime on every prompt, so mtime tracks last-activity, not creation. A
// failure on any single dir must not block the orientation emit below.
let entries = [];
try {
  entries = readdirSync(stateRoot(), { withFileTypes: true });
} catch {
  entries = [];
}
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  if (currentSession && entry.name === currentSession) continue;
  const dir = join(stateRoot(), entry.name);
  try {
    if (Date.now() - statSync(dir).mtimeMs > SEVEN_DAYS_MS) {
      rmSync(dir, { recursive: true, force: true });
    }
  } catch {
    // Skip a single unreadable/locked dir; keep pruning the rest.
  }
}

// Inject orientation as additionalContext (a discreet system reminder) rather
// than stdout transcript text, which reads like a user-issued directive.
try {
  const orientation = readFileSync(join(here, "context", "orientation.md"), "utf8");
  emitContext("SessionStart", orientation.trimEnd());
} catch {
  // If the content file is missing, stay silent rather than crash the session.
}
