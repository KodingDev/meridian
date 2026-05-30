#!/usr/bin/env node
import { readdirSync, statSync, rmSync } from "node:fs";
import { join } from "node:path";
import { readHookInput, safeSessionId, stateRoot, emitContextFile } from "./lib.mjs";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const currentSession = safeSessionId(readHookInput());

// Prune session-state dirs untouched for 7+ days. user-prompt-submit bumps each
// dir's mtime on every prompt, so mtime tracks last-activity, not creation. A
// failure on any single dir must not block the orientation emit below.
const root = stateRoot();
/** @type {import("node:fs").Dirent[]} */
let entries = [];
try {
  entries = readdirSync(root, { withFileTypes: true });
} catch {
  // No state root yet (first run) -- nothing to prune.
}
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  if (currentSession && entry.name === currentSession) continue;
  const dir = join(root, entry.name);
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
emitContextFile("SessionStart", "orientation.md");
