// Cross-platform regression tests for Meridian's hooks. These run the hook
// scripts exactly as Claude Code's exec form does -- `node <hook>` with the
// event payload on stdin -- and assert on stdout/exit code/filesystem effects.
// Built on node:test so they need no dependencies and run identically on
// Linux, macOS, and Windows (the OS matrix that the original bash 3.2 crash
// would have been caught by).

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  existsSync,
  readFileSync,
  rmSync,
  utimesSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HOOKS = join(dirname(fileURLToPath(import.meta.url)), "..", "plugins", "meridian", "hooks");
const SID = "11111111-2222-3333-4444-555555555555";

function tmpConfig() {
  return mkdtempSync(join(tmpdir(), "meridian-"));
}

// Spawn a hook the way Claude Code's exec form does: node binary + script path,
// payload piped to stdin, no shell involved.
function runHook(name, payload, env = {}) {
  const input = typeof payload === "string" ? payload : JSON.stringify(payload);
  try {
    const stdout = execFileSync(process.execPath, [join(HOOKS, name)], {
      input,
      encoding: "utf8",
      env: { ...process.env, ...env },
    });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status ?? 1, stdout: String(err.stdout ?? ""), stderr: String(err.stderr ?? "") };
  }
}

test("session-start emits valid orientation JSON", () => {
  const cfg = tmpConfig();
  const { code, stdout } = runHook(
    "session-start.mjs",
    { session_id: SID, hook_event_name: "SessionStart" },
    { CLAUDE_CONFIG_DIR: cfg },
  );
  assert.equal(code, 0);
  const out = JSON.parse(stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, "SessionStart");
  const ctx = out.hookSpecificOutput.additionalContext;
  assert.match(ctx, /\[Meridian orientation\]/);
  assert.match(ctx, /`meridian:sketch`/);
  // Em-dash survives the round trip: BSD sed on macOS used to mangle this.
  assert.ok(ctx.includes("—"), "em-dash preserved in injected context");
  rmSync(cfg, { recursive: true, force: true });
});

test("session-start still emits orientation with empty stdin", () => {
  const cfg = tmpConfig();
  const { code, stdout } = runHook("session-start.mjs", "", { CLAUDE_CONFIG_DIR: cfg });
  assert.equal(code, 0);
  assert.ok(JSON.parse(stdout).hookSpecificOutput.additionalContext.length > 0);
  rmSync(cfg, { recursive: true, force: true });
});

test("user-prompt-submit emits the routing audit only on the 8th prompt", () => {
  const cfg = tmpConfig();
  for (let i = 1; i <= 7; i++) {
    const { code, stdout } = runHook("user-prompt-submit.mjs", { session_id: SID }, { CLAUDE_CONFIG_DIR: cfg });
    assert.equal(code, 0);
    assert.equal(stdout.trim(), "", `tick ${i} should be silent`);
  }
  const { stdout } = runHook("user-prompt-submit.mjs", { session_id: SID }, { CLAUDE_CONFIG_DIR: cfg });
  const out = JSON.parse(stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, "UserPromptSubmit");
  assert.match(out.hookSpecificOutput.additionalContext, /routing audit/i);
  // The apostrophe in "user's" is what bash 3.2 misread as an unterminated quote.
  assert.ok(out.hookSpecificOutput.additionalContext.includes("user's"), "apostrophe preserved");
  const tick = readFileSync(join(cfg, "meridian", "state", SID, "router-tick"), "utf8").trim();
  assert.equal(tick, "8");
  rmSync(cfg, { recursive: true, force: true });
});

test("user-prompt-submit rejects unsafe session_id without touching the filesystem", () => {
  for (const bad of ["../../../etc/evil", "a/b", "", "has space", "$(touch pwned)"]) {
    const cfg = tmpConfig();
    const { code, stdout } = runHook("user-prompt-submit.mjs", { session_id: bad }, { CLAUDE_CONFIG_DIR: cfg });
    assert.equal(code, 0, `exit 0 for ${JSON.stringify(bad)}`);
    assert.equal(stdout.trim(), "");
    assert.ok(!existsSync(join(cfg, "meridian", "state")), `no state created for ${JSON.stringify(bad)}`);
    rmSync(cfg, { recursive: true, force: true });
  }
});

test("session-end removes its own state dir", () => {
  const cfg = tmpConfig();
  const dir = join(cfg, "meridian", "state", SID);
  mkdirSync(dir, { recursive: true });
  const { code } = runHook("session-end.mjs", { session_id: SID }, { CLAUDE_CONFIG_DIR: cfg });
  assert.equal(code, 0);
  assert.ok(!existsSync(dir), "state dir removed");
  rmSync(cfg, { recursive: true, force: true });
});

test("session-end is a no-op for an unsafe session_id", () => {
  const cfg = tmpConfig();
  const root = join(cfg, "meridian", "state");
  mkdirSync(root, { recursive: true });
  const { code } = runHook("session-end.mjs", { session_id: "../../../../etc" }, { CLAUDE_CONFIG_DIR: cfg });
  assert.equal(code, 0);
  assert.ok(existsSync(root), "state root left untouched");
  rmSync(cfg, { recursive: true, force: true });
});

test("hooks survive malformed JSON on stdin", () => {
  const cfg = tmpConfig();
  for (const name of ["session-start.mjs", "user-prompt-submit.mjs", "session-end.mjs"]) {
    const { code } = runHook(name, "not json {{{", { CLAUDE_CONFIG_DIR: cfg });
    assert.equal(code, 0, `${name} should exit 0 on garbage input`);
  }
  rmSync(cfg, { recursive: true, force: true });
});

test("session-start prunes stale state but keeps current and fresh", () => {
  const cfg = tmpConfig();
  const root = join(cfg, "meridian", "state");
  const stale = join(root, "stale-session");
  const fresh = join(root, "fresh-session");
  const current = join(root, SID);
  for (const d of [stale, fresh, current]) mkdirSync(d, { recursive: true });
  const tenDaysAgo = Date.now() / 1000 - 10 * 24 * 60 * 60;
  utimesSync(stale, tenDaysAgo, tenDaysAgo);
  runHook("session-start.mjs", { session_id: SID }, { CLAUDE_CONFIG_DIR: cfg });
  assert.ok(!existsSync(stale), "stale dir pruned");
  assert.ok(existsSync(fresh), "fresh dir kept");
  assert.ok(existsSync(current), "current session dir kept");
  rmSync(cfg, { recursive: true, force: true });
});

test("hooks.json uses node exec form and references existing scripts", () => {
  const config = JSON.parse(readFileSync(join(HOOKS, "hooks.json"), "utf8"));
  const pluginRoot = join(HOOKS, "..");
  for (const matchers of Object.values(config.hooks)) {
    for (const matcher of matchers) {
      for (const hook of matcher.hooks) {
        assert.equal(hook.command, "node", "exec form must invoke node");
        assert.ok(Array.isArray(hook.args) && hook.args.length === 1, "expects a single script arg");
        const resolved = hook.args[0].replace("${CLAUDE_PLUGIN_ROOT}", pluginRoot);
        assert.ok(existsSync(resolved), `referenced hook script exists: ${hook.args[0]}`);
      }
    }
  }
});
