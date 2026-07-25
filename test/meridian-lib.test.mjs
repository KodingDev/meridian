// Unit tests for the pure decision logic in hooks/lib — exercised directly (no
// subprocess) because these functions take and return plain values. The
// end-to-end exec-form contract lives in meridian-hooks.test.mjs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectHost } from "../hooks/lib/host.mjs";
import {
  activeModel,
  composeBehavior,
  loadBehaviorContext,
  resolveProfile,
} from "../hooks/lib/behavior.mjs";

const REGISTRY = {
  profiles: { exact: ["a"], family: ["b"], fallback: [] },
  modelMatches: [
    { prefix: "model-", profile: "family" },
    { exact: "model-exact", profile: "exact" },
  ],
};

test("activeModel prefers model_id and ignores empty identifiers", () => {
  assert.equal(activeModel({ model_id: "cursor-id", model: "fallback" }), "cursor-id");
  assert.equal(activeModel({ model_id: " ", model: "fallback" }), "fallback");
  assert.equal(activeModel({}), null);
});

test("resolveProfile applies override, exact, family, fallback, then baseline", () => {
  assert.equal(resolveProfile(REGISTRY, "fallback", "model-exact", null), "fallback");
  assert.equal(resolveProfile(REGISTRY, null, "model-exact", "fallback"), "exact");
  assert.equal(resolveProfile(REGISTRY, null, "model-other", "fallback"), "family");
  assert.equal(resolveProfile(REGISTRY, null, "unknown", "fallback"), "fallback");
  assert.equal(resolveProfile(REGISTRY, null, "unknown", null), null);
  assert.equal(resolveProfile(REGISTRY, "missing", "model-exact", "fallback"), null);
});

test("composeBehavior keeps the standard first and preserves adapter order", () => {
  assert.equal(
    composeBehavior(" standard\n", ["adapter one", "\nadapter two\n"]),
    "standard\n\nadapter one\n\nadapter two",
  );
});

test("loadBehaviorContext composes detected, fallback, and baseline-only profiles", () => {
  const stateBase = mkdtempSync(join(tmpdir(), "meridian-profile-"));
  const opus = loadBehaviorContext({
    input: { model: "claude-opus-4-8" },
    stateBase,
  });
  assert.match(opus, /professional engineering standard/i);
  assert.match(opus, /comment narration/i);
  assert.match(opus, /artifact overproduction/i);
  assert.ok(opus.indexOf("professional engineering standard") < opus.indexOf("comment narration"));
  assert.ok(opus.indexOf("comment narration") < opus.indexOf("artifact overproduction"));

  mkdirSync(join(stateBase, "meridian"), { recursive: true });
  writeFileSync(
    join(stateBase, "meridian", "config.json"),
    JSON.stringify({ fallbackProfile: "sol" }),
  );
  const fallback = loadBehaviorContext({ input: {}, stateBase });
  assert.match(fallback, /review recursion/i);
  assert.doesNotMatch(fallback, /comment narration/i);

  const baseline = loadBehaviorContext({
    input: { model: "claude-opus-4-8" },
    stateBase,
    environmentProfile: "missing",
  });
  assert.match(baseline, /professional engineering standard/i);
  assert.doesNotMatch(baseline, /model adapter/i);
  rmSync(stateBase, { recursive: true, force: true });
});

test("shipped registry applies family corrections beyond the mapped release", () => {
  const stateBase = mkdtempSync(join(tmpdir(), "meridian-family-"));

  for (const model of ["claude-opus-5", "claude-opus-5[1m]", "claude-opus-4-8"]) {
    const context = loadBehaviorContext({ input: { model }, stateBase });
    assert.match(context, /comment narration/i, `${model} receives family adapters`);
  }

  for (const model of ["claude-sonnet-5", "gpt-5-codex"]) {
    const context = loadBehaviorContext({ input: { model }, stateBase });
    assert.doesNotMatch(context, /model adapter/i, `${model} stays on the baseline`);
  }

  rmSync(stateBase, { recursive: true, force: true });
});

test("detectHost resolves the Cursor state base", () => {
  const saved = {
    CURSOR_PLUGIN_ROOT: process.env.CURSOR_PLUGIN_ROOT,
    CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR,
    CLAUDE_PLUGIN_ROOT: process.env.CLAUDE_PLUGIN_ROOT,
  };
  delete process.env.CLAUDE_CONFIG_DIR;
  delete process.env.CLAUDE_PLUGIN_ROOT;
  process.env.CURSOR_PLUGIN_ROOT = "/fake/plugin";
  const host = detectHost();
  assert.equal(host.name, "cursor");
  assert.equal(host.stateBase, join(homedir(), ".cursor"));
  for (const [key, val] of Object.entries(saved)) {
    if (val === undefined) delete process.env[key];
    else process.env[key] = val;
  }
});

test("detectHost resolves the Copilot state base", () => {
  const saved = {
    CURSOR_PLUGIN_ROOT: process.env.CURSOR_PLUGIN_ROOT,
    COPILOT_PLUGIN_ROOT: process.env.COPILOT_PLUGIN_ROOT,
    COPILOT_HOME: process.env.COPILOT_HOME,
    CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR,
    CLAUDE_PLUGIN_ROOT: process.env.CLAUDE_PLUGIN_ROOT,
  };
  delete process.env.CLAUDE_CONFIG_DIR;
  delete process.env.CLAUDE_PLUGIN_ROOT;
  delete process.env.CURSOR_PLUGIN_ROOT;
  delete process.env.COPILOT_HOME;
  process.env.COPILOT_PLUGIN_ROOT = "/fake/plugin";
  const host = detectHost();
  assert.equal(host.name, "copilot");
  assert.equal(host.stateBase, join(homedir(), ".copilot"));
  for (const [key, val] of Object.entries(saved)) {
    if (val === undefined) delete process.env[key];
    else process.env[key] = val;
  }
});

test("Copilot state base stays ~/.copilot even when CLAUDE_PLUGIN_ROOT is also set", () => {
  // The exact production env: Copilot sets both COPILOT_PLUGIN_ROOT and
  // CLAUDE_PLUGIN_ROOT. Pins the candidate ordering so copilot never falls
  // through to the ~/.claude branch.
  const saved = {
    CURSOR_PLUGIN_ROOT: process.env.CURSOR_PLUGIN_ROOT,
    COPILOT_PLUGIN_ROOT: process.env.COPILOT_PLUGIN_ROOT,
    COPILOT_HOME: process.env.COPILOT_HOME,
    CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR,
    CLAUDE_PLUGIN_ROOT: process.env.CLAUDE_PLUGIN_ROOT,
  };
  delete process.env.CLAUDE_CONFIG_DIR;
  delete process.env.CURSOR_PLUGIN_ROOT;
  delete process.env.COPILOT_HOME;
  process.env.COPILOT_PLUGIN_ROOT = "/fake/plugin";
  process.env.CLAUDE_PLUGIN_ROOT = "/fake/plugin";
  const host = detectHost();
  assert.equal(host.name, "copilot");
  assert.equal(host.stateBase, join(homedir(), ".copilot"));
  for (const [key, val] of Object.entries(saved)) {
    if (val === undefined) delete process.env[key];
    else process.env[key] = val;
  }
});

test("detectHost resolves the Codex state base", () => {
  // Codex ships no unique identity var; it sets the un-prefixed PLUGIN_ROOT (plus
  // CLAUDE_PLUGIN_ROOT for compat) — the documented discriminator from Claude, which
  // sets only CLAUDE_PLUGIN_ROOT. Codex and Claude share the SessionStart output shape.
  const saved = {
    CURSOR_PLUGIN_ROOT: process.env.CURSOR_PLUGIN_ROOT,
    COPILOT_PLUGIN_ROOT: process.env.COPILOT_PLUGIN_ROOT,
    PLUGIN_ROOT: process.env.PLUGIN_ROOT,
    CODEX_HOME: process.env.CODEX_HOME,
    CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR,
    CLAUDE_PLUGIN_ROOT: process.env.CLAUDE_PLUGIN_ROOT,
  };
  delete process.env.CLAUDE_CONFIG_DIR;
  delete process.env.CURSOR_PLUGIN_ROOT;
  delete process.env.COPILOT_PLUGIN_ROOT;
  delete process.env.CODEX_HOME;
  process.env.PLUGIN_ROOT = "/fake/plugin";
  process.env.CLAUDE_PLUGIN_ROOT = "/fake/plugin";
  const host = detectHost();
  assert.equal(host.name, "codex");
  assert.equal(host.stateBase, join(homedir(), ".codex"));
  for (const [key, val] of Object.entries(saved)) {
    if (val === undefined) delete process.env[key];
    else process.env[key] = val;
  }
});

test("detectHost defaults to claude", () => {
  const saved = {
    CURSOR_PLUGIN_ROOT: process.env.CURSOR_PLUGIN_ROOT,
    COPILOT_PLUGIN_ROOT: process.env.COPILOT_PLUGIN_ROOT,
    PLUGIN_ROOT: process.env.PLUGIN_ROOT,
  };
  delete process.env.CURSOR_PLUGIN_ROOT;
  delete process.env.COPILOT_PLUGIN_ROOT;
  delete process.env.PLUGIN_ROOT;
  const host = detectHost();
  assert.equal(host.name, "claude");
  for (const [key, val] of Object.entries(saved)) {
    if (val === undefined) delete process.env[key];
    else process.env[key] = val;
  }
});
