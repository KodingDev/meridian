// Unit tests for the pure decision logic in hooks/lib — exercised directly (no
// subprocess) because these functions take and return plain values. The
// end-to-end exec-form contract lives in meridian-hooks.test.mjs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { homedir } from "node:os";
import { join } from "node:path";
import { auditDue, isFailureSignal, sessionId } from "../hooks/lib/signals.mjs";
import { detectHost } from "../hooks/lib/host.mjs";

test("sessionId accepts safe session_id / conversation_id, rejects the rest", () => {
  assert.equal(sessionId({ session_id: "abc-123_DEF" }), "abc-123_DEF");
  assert.equal(sessionId({ conversation_id: "cursor-conv-1" }), "cursor-conv-1");
  assert.equal(sessionId({ sessionId: "copilot-1" }), "copilot-1");
  assert.equal(sessionId({ session_id: "s", conversation_id: "c" }), "s", "session_id wins");
  assert.equal(
    sessionId({ session_id: "s", sessionId: "p" }),
    "s",
    "session_id wins over sessionId",
  );
  for (const bad of ["../../etc/evil", "a/b", "has space", "$(touch x)", "", undefined, 42]) {
    assert.equal(
      sessionId(/** @type {any} */ ({ session_id: bad })),
      null,
      `rejects ${JSON.stringify(bad)}`,
    );
  }
  assert.equal(sessionId({}), null);
});

test("isFailureSignal matches only terse 'fix didn't land' replies", () => {
  for (const p of [
    "still broken",
    "not fixed",
    "doesn't work",
    "still doesnt work",
    "nope, still wrong",
    "STILL BROKEN.",
    "that's still broken",
  ]) {
    assert.equal(isFailureSignal(p), true, `matches ${JSON.stringify(p)}`);
  }
  for (const p of [
    "nope", // bare nope deliberately excluded
    "no, the real issue is still broken because the cache never clears so rework it", // elaborated
    "can you add a copy button to the toolbar", // unrelated
    "is the build working", // question
    "",
    42,
    undefined,
  ]) {
    assert.equal(isFailureSignal(p), false, `ignores ${JSON.stringify(p)}`);
  }
});

test("auditDue fires every Nth count, never at 0", () => {
  assert.equal(auditDue(8, 8), true);
  assert.equal(auditDue(16, 8), true);
  assert.equal(auditDue(7, 8), false);
  assert.equal(auditDue(9, 8), false);
  assert.equal(auditDue(0, 8), false);
});

test("detectHost resolves the Cursor state base and event support", () => {
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
  assert.equal(host.supportsContext("SessionStart"), true);
  assert.equal(host.supportsContext("UserPromptSubmit"), false);
  for (const [key, val] of Object.entries(saved)) {
    if (val === undefined) delete process.env[key];
    else process.env[key] = val;
  }
});

test("detectHost resolves the Copilot state base and event support", () => {
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
  assert.equal(host.supportsContext("SessionStart"), true);
  assert.equal(host.supportsContext("UserPromptSubmit"), false);
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

test("detectHost defaults to claude and injects on every event", () => {
  const saved = {
    CURSOR_PLUGIN_ROOT: process.env.CURSOR_PLUGIN_ROOT,
    COPILOT_PLUGIN_ROOT: process.env.COPILOT_PLUGIN_ROOT,
  };
  delete process.env.CURSOR_PLUGIN_ROOT;
  delete process.env.COPILOT_PLUGIN_ROOT;
  const host = detectHost();
  assert.equal(host.name, "claude");
  assert.equal(host.supportsContext("UserPromptSubmit"), true);
  for (const [key, val] of Object.entries(saved)) {
    if (val === undefined) delete process.env[key];
    else process.env[key] = val;
  }
});
