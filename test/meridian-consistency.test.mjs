// Consistency guards for contracts duplicated across host manifests and skills.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANUAL_FLOWS = ["auto", "brainstorm", "document", "execute", "review", "sketch"];
const MODEL_DISCIPLINES = ["commit", "debug", "delegate", "research", "respond", "triangulate"];

/** @param {string} rel */
function readJSON(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

function skillNames() {
  return readdirSync(join(ROOT, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function agentNames() {
  return readdirSync(join(ROOT, "agents"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.slice(0, -3));
}

function markdownFiles() {
  const files = [];
  for (const dir of ["skills", "agents", "behavior"]) {
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
  for (const rel of [".cursor-plugin/plugin.json", ".plugin/plugin.json"]) {
    const version = readJSON(rel).version;
    if (version !== undefined) assert.equal(version, claude, `${rel} version matches`);
  }
});

test("each skill frontmatter name matches its directory", () => {
  for (const name of skillNames()) {
    const body = readFileSync(join(ROOT, "skills", name, "SKILL.md"), "utf8");
    assert.equal(body.match(/^name:\s*(.+)$/m)?.[1]?.trim(), name, `skills/${name}/SKILL.md`);
  }
});

test("manual flows are manual-only on shared and Codex skill surfaces", () => {
  for (const name of MANUAL_FLOWS) {
    const body = readFileSync(join(ROOT, "skills", name, "SKILL.md"), "utf8");
    assert.match(body, /^disable-model-invocation:\s*true$/m, `${name} shared manual-only policy`);
    const codex = readFileSync(join(ROOT, "skills", name, "agents", "openai.yaml"), "utf8");
    assert.match(
      codex,
      /^\s*allow_implicit_invocation:\s*false$/m,
      `${name} Codex manual-only policy`,
    );
  }
});

test("model disciplines remain available for implicit invocation", () => {
  for (const name of MODEL_DISCIPLINES) {
    const body = readFileSync(join(ROOT, "skills", name, "SKILL.md"), "utf8");
    assert.doesNotMatch(body, /^disable-model-invocation:/m, `${name} shared invocation policy`);
    assert.equal(existsSync(join(ROOT, "skills", name, "agents", "openai.yaml")), false);
  }
});

test("commit conventions are reachable without authorizing outward actions", () => {
  const body = readFileSync(join(ROOT, "skills", "commit", "SKILL.md"), "utf8");
  const description = body.match(/^description:\s*(.+)$/m)?.[1] ?? "";

  assert.match(description, /pull request/i, "description reaches PR authoring");
  assert.match(description, /another skill needs/i, "description is reachable by other skills");
  assert.match(body, /^<HARD-GATE>$/m, "outward actions sit behind a hard gate");
  assert.match(
    body,
    /require an explicit user request for that action/,
    "the gate names per-action authorization",
  );
  assert.ok(
    body.indexOf("<HARD-GATE>") < body.indexOf("# Commit"),
    "the gate is read before the flow",
  );
  assert.match(body, /^## Pull request descriptions$/m, "PR guidance is present");
});

test("model discipline descriptions stay narrower than baseline grounding", () => {
  const research = readFileSync(join(ROOT, "skills", "research", "SKILL.md"), "utf8");
  const triangulate = readFileSync(join(ROOT, "skills", "triangulate", "SKILL.md"), "utf8");
  const researchDescription = research.match(/^description:\s*(.+)$/m)?.[1] ?? "";
  const triangulateDescription = triangulate.match(/^description:\s*(.+)$/m)?.[1] ?? "";

  assert.match(researchDescription, /external API and library contracts/);
  assert.doesNotMatch(researchDescription, /technical claims|definite claims/);
  assert.match(triangulateDescription, /sources conflict|load-bearing|hard-to-reverse/);
  assert.doesNotMatch(triangulateDescription, /definite claims/);
});

test("interactive manual flows define a plain-text question fallback", () => {
  for (const name of ["brainstorm", "sketch"]) {
    const body = readFileSync(join(ROOT, "skills", name, "SKILL.md"), "utf8");
    assert.match(body, /structured question tool/);
    assert.match(body, /plain text/);
    assert.match(body, /when (?:that tool is )?unavailable|when unavailable/);
  }
});

test("formal review covers untracked working-tree files", () => {
  const body = readFileSync(join(ROOT, "skills", "review", "SKILL.md"), "utf8");
  assert.match(body, /git status --short/);
  assert.match(body, /full contents of every untracked file/);
  assert.match(body, /complete change manifest/);
});

test("behavior profiles reference only packaged atomic adapters", () => {
  const registry = readJSON("behavior/profiles.json");
  const packaged = new Set(
    readdirSync(join(ROOT, "behavior", "adapters"))
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.slice(0, -3)),
  );

  for (const [profile, adapters] of Object.entries(registry.profiles)) {
    assert.ok(Array.isArray(adapters), `${profile} is an adapter list`);
    assert.equal(new Set(adapters).size, adapters.length, `${profile} has no duplicate adapters`);
    for (const adapter of adapters) {
      assert.match(adapter, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${adapter} is a registry id`);
      assert.ok(packaged.has(adapter), `${profile} references packaged adapter ${adapter}`);
    }
  }

  for (const match of registry.modelMatches) {
    assert.ok(registry.profiles[match.profile], `${match.profile} is a known profile`);
    const key = match.exact ?? match.prefix;
    assert.ok(typeof key === "string" && key.length > 0, "model match has a non-empty key");
    assert.ok(
      match.exact === undefined || match.prefix === undefined,
      "model match is exact or prefix, not both",
    );
  }
});

test("removed workflow routing and session state surfaces stay removed", () => {
  for (const rel of [
    "hooks/context/orientation.md",
    "hooks/context/routing-audit.md",
    "hooks/context/debug-reroute.md",
    "hooks/user-prompt-submit.mjs",
    "hooks/session-end.mjs",
    "hooks/lib/state.mjs",
    "output-styles/meridian.md",
  ]) {
    assert.equal(existsSync(join(ROOT, rel)), false, `${rel} remains removed`);
  }
});

test("every meridian:<x> reference resolves to a real skill or agent", () => {
  const valid = new Set([...skillNames(), ...agentNames()]);
  for (const file of markdownFiles()) {
    const body = readFileSync(file, "utf8");
    for (const match of body.matchAll(/meridian:(\w+)/g)) {
      assert.ok(valid.has(match[1]), `${match[0]} in ${file.slice(ROOT.length + 1)} resolves`);
    }
  }
});
