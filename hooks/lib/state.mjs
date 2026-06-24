// Session-state directory operations. All state lives under
// `<host.stateBase>/meridian/state/<sessionId>/`; ids are assumed pre-validated
// by `signals.sessionId` (a single safe path segment).

import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

/** @typedef {import("./types.mjs").Host} Host */

/**
 * @param {Host} host
 * @returns {string}
 */
function root(host) {
  return join(host.stateBase, "meridian", "state");
}

/**
 * @param {Host} host
 * @param {string} id
 * @returns {string}
 */
export function sessionDir(host, id) {
  return join(root(host), id);
}

/**
 * Ensure the session dir exists and bump its mtime so prune tracks last-activity.
 * Best-effort: a failed touch only risks an early prune of an idle session.
 * @param {Host} host
 * @param {string} id
 */
export function touch(host, id) {
  const dir = sessionDir(host, id);
  try {
    mkdirSync(dir, { recursive: true });
    utimesSync(dir, new Date(), new Date());
  } catch {
    // best-effort: a failed touch only risks an early prune of an idle session
  }
}

/**
 * Increment and return this session's prompt counter (1 on the first prompt).
 * A failed read starts from 0; a failed write just replays the tick next prompt.
 * @param {Host} host
 * @param {string} id
 * @returns {number}
 */
export function tick(host, id) {
  const file = join(sessionDir(host, id), "router-tick");
  let count = 0;
  try {
    const raw = readFileSync(file, "utf8").trim();
    if (/^\d+$/.test(raw)) count = parseInt(raw, 10);
  } catch {
    // no tick file yet
  }
  count += 1;
  try {
    writeFileSync(file, count + "\n");
  } catch {
    // replays next prompt
  }
  return count;
}

/**
 * Remove session dirs untouched for longer than `maxAgeMs`, except the current
 * session. Skips an individually unreadable/locked dir rather than aborting.
 * @param {Host} host
 * @param {string | null} currentId
 * @param {number} maxAgeMs
 */
export function pruneStale(host, currentId, maxAgeMs) {
  /** @type {import("node:fs").Dirent[]} */
  let entries;
  try {
    entries = readdirSync(root(host), { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (currentId && entry.name === currentId) continue;
    const dir = join(root(host), entry.name);
    try {
      if (Date.now() - statSync(dir).mtimeMs > maxAgeMs) {
        rmSync(dir, { recursive: true, force: true });
      }
    } catch {
      // skip unreadable dir
    }
  }
}

/**
 * @param {Host} host
 * @param {string} id
 */
export function clear(host, id) {
  try {
    rmSync(sessionDir(host, id), { recursive: true, force: true });
  } catch {
    // best-effort: cleanup only; a left-behind dir is pruned later by age
  }
}
