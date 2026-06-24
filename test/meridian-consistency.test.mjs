// Consistency guards for facts that live in more than one file and silently drift.
// Plugin version across the per-host manifests is the first: .claude-plugin and
// .cursor-plugin diverged once (0.10.9 vs 0.10.8) and `claude plugin validate`
// only inspects the Claude manifest, so nothing caught it.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @param {string} rel */
function readJSON(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

/** Skill directory names (those carrying a SKILL.md). */
function skillNames() {
  return readdirSync(join(ROOT, "skills"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

/** Agent names registered under agents/ (basename without .md). */
function agentNames() {
  return readdirSync(join(ROOT, "agents"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3));
}

/** Markdown files where a meridian:<x> reference is load-bearing. */
function docFiles() {
  const dirs = ["skills", "agents", "hooks/context", "output-styles"];
  /** @type {string[]} */
  const files = [];
  for (const dir of dirs) {
    for (const entry of readdirSync(join(ROOT, dir), { recursive: true, withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".md"))
        files.push(join(entry.parentPath, entry.name));
    }
  }
  files.push(join(ROOT, "README.md"));
  return files;
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

test("each skill's frontmatter name matches its directory", () => {
  for (const name of skillNames()) {
    const body = readFileSync(join(ROOT, "skills", name, "SKILL.md"), "utf8");
    const declared = body.match(/^name:\s*(.+)$/m)?.[1]?.trim();
    assert.equal(declared, name, `skills/${name}/SKILL.md name frontmatter`);
  }
});

test("every meridian:<x> reference resolves to a real skill or agent", () => {
  // Catches a routing table, dispatch, or doc pointing at a renamed/removed/typo'd
  // skill or agent — the drift class behind a table that lists what no longer exists.
  const valid = new Set([...skillNames(), ...agentNames()]);
  for (const file of docFiles()) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/meridian:(\w+)/g)) {
      assert.ok(
        valid.has(match[1]),
        `${match[0]} in ${file.slice(ROOT.length + 1)} has no skill or agent`,
      );
    }
  }
});
