// Consistency guards for facts that live in more than one file and silently drift.
// Plugin version across the per-host manifests is the first: .claude-plugin and
// .cursor-plugin diverged once (0.10.9 vs 0.10.8) and `claude plugin validate`
// only inspects the Claude manifest, so nothing caught it.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @param {string} rel */
function readJSON(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

test("per-host plugin manifests declare the same version", () => {
  const claude = readJSON(".claude-plugin/plugin.json").version;
  assert.match(claude, /^\d+\.\d+\.\d+$/, "Claude manifest has a semver version");
  // Compare against the Claude manifest rather than a literal, so a release bump
  // touches the manifests but never this test.
  for (const rel of [".cursor-plugin/plugin.json", ".plugin/plugin.json"]) {
    const version = readJSON(rel).version;
    if (version === undefined) continue; // a manifest may omit version; if present it must agree
    assert.equal(version, claude, `${rel} version matches the Claude manifest`);
  }
});
