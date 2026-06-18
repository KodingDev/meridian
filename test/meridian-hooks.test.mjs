// Cross-platform regression tests for Meridian's hooks. These run the hook
// scripts exactly as Claude Code's exec form does -- `node <hook>` with the
// event payload on stdin -- and assert on stdout/exit code/filesystem effects.
// Built on node:test so they need no dependencies and run identically on
// Linux, macOS, and Windows (the OS matrix that the original bash 3.2 crash
// would have been caught by).

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, rmSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HOOKS = join(dirname(fileURLToPath(import.meta.url)), "..", "hooks");
const SID = "11111111-2222-3333-4444-555555555555";

function tmpConfig() {
  return mkdtempSync(join(tmpdir(), "meridian-"));
}

// Spawn a hook the way Claude Code's exec form does: node binary + script path,
// payload piped to stdin, no shell involved.
/**
 * @param {string} name
 * @param {object | string} payload
 * @param {Record<string, string>} [env]
 */
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
    const e = /** @type {any} */ (err);
    return { code: e.status ?? 1, stdout: String(e.stdout ?? ""), stderr: String(e.stderr ?? "") };
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
    const { code, stdout } = runHook(
      "user-prompt-submit.mjs",
      { session_id: SID },
      { CLAUDE_CONFIG_DIR: cfg },
    );
    assert.equal(code, 0);
    assert.equal(stdout.trim(), "", `tick ${i} should be silent`);
  }
  const { stdout } = runHook(
    "user-prompt-submit.mjs",
    { session_id: SID },
    { CLAUDE_CONFIG_DIR: cfg },
  );
  const out = JSON.parse(stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, "UserPromptSubmit");
  assert.match(out.hookSpecificOutput.additionalContext, /routing audit/i);
  // The apostrophe in "user's" is what bash 3.2 misread as an unterminated quote.
  assert.ok(out.hookSpecificOutput.additionalContext.includes("user's"), "apostrophe preserved");
  const tick = readFileSync(join(cfg, "meridian", "state", SID, "router-tick"), "utf8").trim();
  assert.equal(tick, "8");
  rmSync(cfg, { recursive: true, force: true });
});

test("user-prompt-submit emits the debug reroute on a terse failure reply", () => {
  for (const prompt of [
    "still broken",
    "not fixed",
    "doesn't work",
    "still doesnt work",
    "nope, still wrong",
    "STILL BROKEN.",
  ]) {
    const cfg = tmpConfig();
    const { code, stdout } = runHook(
      "user-prompt-submit.mjs",
      { session_id: SID, prompt },
      { CLAUDE_CONFIG_DIR: cfg },
    );
    assert.equal(code, 0);
    const out = JSON.parse(stdout);
    assert.equal(out.hookSpecificOutput.hookEventName, "UserPromptSubmit");
    assert.match(
      out.hookSpecificOutput.additionalContext,
      /debug reroute/i,
      `should reroute on ${JSON.stringify(prompt)}`,
    );
    rmSync(cfg, { recursive: true, force: true });
  }
});

test("user-prompt-submit does NOT reroute on elaborated or unrelated messages", () => {
  // Anchored whole-message match: an elaborated bug report or a normal request
  // must stay silent. Substring matching here would be the false-positive footgun.
  for (const prompt of [
    "no, the real issue is still broken because the cache never clears so rework it",
    "can you add a copy button to the toolbar",
    "nope", // bare nope is deliberately excluded as too ambiguous
    "is the build working",
  ]) {
    const cfg = tmpConfig();
    const { code, stdout } = runHook(
      "user-prompt-submit.mjs",
      { session_id: SID, prompt },
      { CLAUDE_CONFIG_DIR: cfg },
    );
    assert.equal(code, 0);
    assert.equal(stdout.trim(), "", `should be silent on ${JSON.stringify(prompt)}`);
    rmSync(cfg, { recursive: true, force: true });
  }
});

test("debug reroute fires on the first prompt and pre-empts the periodic audit", () => {
  const cfg = tmpConfig();
  // Advance to the audit tick, but make the 8th prompt a failure signal: reroute wins.
  for (let i = 1; i <= 7; i++) {
    runHook(
      "user-prompt-submit.mjs",
      { session_id: SID, prompt: "keep going" },
      { CLAUDE_CONFIG_DIR: cfg },
    );
  }
  const { stdout } = runHook(
    "user-prompt-submit.mjs",
    { session_id: SID, prompt: "still broken" },
    { CLAUDE_CONFIG_DIR: cfg },
  );
  const out = JSON.parse(stdout);
  assert.match(out.hookSpecificOutput.additionalContext, /debug reroute/i);
  assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /routing audit/i);
  rmSync(cfg, { recursive: true, force: true });
});

test("user-prompt-submit rejects unsafe session_id without touching the filesystem", () => {
  for (const bad of ["../../../etc/evil", "a/b", "", "has space", "$(touch pwned)"]) {
    const cfg = tmpConfig();
    const { code, stdout } = runHook(
      "user-prompt-submit.mjs",
      { session_id: bad },
      { CLAUDE_CONFIG_DIR: cfg },
    );
    assert.equal(code, 0, `exit 0 for ${JSON.stringify(bad)}`);
    assert.equal(stdout.trim(), "");
    assert.ok(
      !existsSync(join(cfg, "meridian", "state")),
      `no state created for ${JSON.stringify(bad)}`,
    );
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
  const { code } = runHook(
    "session-end.mjs",
    { session_id: "../../../../etc" },
    { CLAUDE_CONFIG_DIR: cfg },
  );
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

test("emitted additionalContext is a single-line JSON payload", () => {
  // The rewrite exists to stop multi-line/multibyte content corrupting the
  // protocol. JSON.parse succeeds on pretty-printed JSON too, so assert the
  // payload is exactly one line + a trailing newline -- a switch to
  // JSON.stringify(x, null, 2) would fail here, not slip through.
  const cfg = tmpConfig();
  const start = runHook("session-start.mjs", { session_id: SID }, { CLAUDE_CONFIG_DIR: cfg });
  assert.ok(start.stdout.endsWith("\n"), "session-start ends with a trailing newline");
  assert.ok(!start.stdout.trimEnd().includes("\n"), "session-start payload is one line");

  let audit = { stdout: "" };
  for (let i = 1; i <= 8; i++) {
    audit = runHook("user-prompt-submit.mjs", { session_id: SID }, { CLAUDE_CONFIG_DIR: cfg });
  }
  assert.ok(audit.stdout.endsWith("\n"), "audit ends with a trailing newline");
  assert.ok(!audit.stdout.trimEnd().includes("\n"), "audit payload is one line");
  rmSync(cfg, { recursive: true, force: true });
});

test("hooks.json resolves the plugin root from env at runtime (cross-engine)", () => {
  // Engines disagree on how the plugin root reaches a hook: Claude Code substitutes
  // ${CLAUDE_PLUGIN_ROOT}; Copilot Chat sets only PLUGIN_ROOT and substitutes nothing.
  // Resolve it inside node from either var so the command is shell-agnostic (works under
  // sh AND PowerShell, where ${VAR:-default} would fail) and spawn the script directly —
  // NOT via import()/pathToFileURL, which throws ERR_INVALID_MODULE_SPECIFIER on newer
  // node when the path carries backslashes. A bare command:"node"+args crashes the
  // no-args engines, so args must be absent. Under WSL, Copilot Chat hands over a Windows
  // path (C:\...); translate it to the mount via wslpath, falling back to /mnt. The whole
  // thing must contain no backslash literals (the shell eats them), so the split uses
  // String.fromCharCode(92).
  const config = JSON.parse(readFileSync(join(HOOKS, "hooks.json"), "utf8"));
  const pluginRoot = join(HOOKS, "..");
  for (const matchers of Object.values(config.hooks)) {
    for (const matcher of matchers) {
      for (const hook of matcher.hooks) {
        assert.equal(hook.args, undefined, "must not use the command+args exec form");
        assert.doesNotMatch(
          hook.command,
          /\$\{[A-Z_]+\}/,
          "must not rely on engine/shell ${VAR} substitution",
        );
        assert.doesNotMatch(
          hook.command,
          /import\(|pathToFileURL/,
          "must not use dynamic import() (ERR_INVALID_MODULE_SPECIFIER on newer node)",
        );
        assert.match(
          hook.command,
          /process\.env\.CLAUDE_PLUGIN_ROOT\s*\|\|\s*process\.env\.PLUGIN_ROOT/,
          "resolves the root from CLAUDE_PLUGIN_ROOT or PLUGIN_ROOT",
        );
        assert.doesNotMatch(hook.command, /\\/, "no backslash literals (the shell eats them)");
        assert.match(
          hook.command,
          /wslpath[\s\S]*\/mnt\//,
          "translates a WSL Windows plugin-root path (wslpath, then /mnt fallback)",
        );
        const m = hook.command.match(/\/(hooks\/[\w-]+\.mjs)'/);
        assert.ok(m, `command embeds the script path: ${hook.command}`);
        assert.ok(existsSync(join(pluginRoot, m[1])), `referenced hook script exists: ${m[1]}`);
      }
    }
  }
});

test("hooks.json SessionStart runs from any engine env, even with the wrong cwd", () => {
  // Reproduce both engines: command run via shell, payload on stdin, no args, cwd is NOT
  // the plugin dir (Copilot Chat runs hooks from $HOME). It must still resolve and emit
  // the orientation whether the engine provides CLAUDE_PLUGIN_ROOT (Claude Code / Copilot
  // CLI) or only PLUGIN_ROOT (Copilot Chat).
  const pluginRoot = join(HOOKS, "..");
  const config = JSON.parse(readFileSync(join(HOOKS, "hooks.json"), "utf8"));
  const command = config.hooks.SessionStart[0].hooks[0].command;
  for (const rootVar of ["CLAUDE_PLUGIN_ROOT", "PLUGIN_ROOT"]) {
    const cfg = tmpConfig();
    /** @type {Record<string, string | undefined>} */
    const env = { ...process.env, CLAUDE_CONFIG_DIR: cfg };
    delete env.CLAUDE_PLUGIN_ROOT;
    delete env.PLUGIN_ROOT;
    delete env.COPILOT_PLUGIN_ROOT;
    delete env.CURSOR_PLUGIN_ROOT;
    env[rootVar] = pluginRoot;
    let out;
    try {
      out = execSync(command, {
        cwd: tmpdir(),
        input: JSON.stringify({ session_id: SID, hook_event_name: "SessionStart" }),
        encoding: "utf8",
        env,
      });
    } catch (err) {
      const e = /** @type {any} */ (err);
      assert.fail(`hook command failed with only ${rootVar} set: ${e.stderr || e.message}`);
    }
    assert.match(
      JSON.parse(out).hookSpecificOutput.additionalContext,
      /\[Meridian orientation\]/,
      `orientation emitted with only ${rootVar} set`,
    );
    rmSync(cfg, { recursive: true, force: true });
  }
});

test("hooks-cursor.json invokes node hook scripts", () => {
  const config = JSON.parse(readFileSync(join(HOOKS, "hooks-cursor.json"), "utf8"));
  assert.equal(config.version, 1);
  for (const entries of Object.values(config.hooks)) {
    for (const entry of entries) {
      assert.match(entry.command, /^node \.\/hooks\/[\w-]+\.mjs$/);
      const script = entry.command.slice("node ./hooks/".length);
      assert.ok(existsSync(join(HOOKS, script)), `cursor hook script exists: ${script}`);
    }
  }
});

test("session-start emits additional_context on Cursor", () => {
  const cfg = tmpConfig();
  const { code, stdout } = runHook(
    "session-start.mjs",
    { session_id: SID, hook_event_name: "sessionStart" },
    { CURSOR_PLUGIN_ROOT: "/fake/plugin", CLAUDE_CONFIG_DIR: cfg },
  );
  assert.equal(code, 0);
  const out = JSON.parse(stdout);
  assert.ok(out.additional_context);
  assert.equal(out.hookSpecificOutput, undefined);
  assert.match(out.additional_context, /\[Meridian orientation\]/);
  rmSync(cfg, { recursive: true, force: true });
});

test("user-prompt-submit accepts conversation_id on Cursor", () => {
  const cfg = tmpConfig();
  const conv = "cursor-conv-abc123";
  for (let i = 1; i <= 8; i++) {
    const { code, stdout } = runHook(
      "user-prompt-submit.mjs",
      { conversation_id: conv, prompt: "hi" },
      { CURSOR_PLUGIN_ROOT: "/fake/plugin", CLAUDE_CONFIG_DIR: cfg },
    );
    assert.equal(code, 0);
    assert.equal(stdout.trim(), "", `cursor tick ${i} should be silent (no audit emit)`);
  }
  assert.ok(
    existsSync(join(cfg, "meridian", "state", conv)),
    "state dir created from conversation_id",
  );
  assert.ok(
    !existsSync(join(cfg, "meridian", "state", conv, "router-tick")),
    "cursor should not write router-tick",
  );
  rmSync(cfg, { recursive: true, force: true });
});

test("hooks-copilot.json invokes node hook scripts via single-string command", () => {
  const config = JSON.parse(readFileSync(join(HOOKS, "hooks-copilot.json"), "utf8"));
  assert.equal(config.version, 1);
  for (const entries of Object.values(config.hooks)) {
    for (const entry of entries) {
      // Copilot treats `command` as a shell string and ignores `args`; the
      // command+args exec form is what crashes it. Guard against a regression.
      assert.match(entry.command, /^node \.\/hooks\/[\w-]+\.mjs$/);
      assert.equal(entry.args, undefined, "copilot must not use the command+args exec form");
      const script = entry.command.slice("node ./hooks/".length);
      assert.ok(existsSync(join(HOOKS, script)), `copilot hook script exists: ${script}`);
    }
  }
});

test(".plugin/plugin.json redirects Copilot to its hooks config", () => {
  const manifest = JSON.parse(readFileSync(join(HOOKS, "..", ".plugin", "plugin.json"), "utf8"));
  assert.equal(typeof manifest.hooks, "string", "declares a hooks config path");
  assert.ok(
    existsSync(join(HOOKS, "..", manifest.hooks)),
    `redirect target exists: ${manifest.hooks}`,
  );
});

test("session-start emits flat additionalContext on Copilot", () => {
  const cfg = tmpConfig();
  const { code, stdout } = runHook(
    "session-start.mjs",
    { sessionId: SID, hook_event_name: "sessionStart" },
    { COPILOT_PLUGIN_ROOT: "/fake/plugin", CLAUDE_CONFIG_DIR: cfg },
  );
  assert.equal(code, 0);
  const out = JSON.parse(stdout);
  assert.ok(out.additionalContext, "flat additionalContext present");
  assert.equal(out.hookSpecificOutput, undefined, "not Claude's nested form");
  assert.equal(out.additional_context, undefined, "not Cursor's snake_case form");
  assert.match(out.additionalContext, /\[Meridian orientation\]/);
  rmSync(cfg, { recursive: true, force: true });
});

test("user-prompt-submit is state-only on Copilot (no injection, even on a failure signal)", () => {
  const cfg = tmpConfig();
  const sid = "copilot-sess-abc123";
  for (let i = 1; i <= 8; i++) {
    const { code, stdout } = runHook(
      "user-prompt-submit.mjs",
      { sessionId: sid, prompt: "still broken" },
      { COPILOT_PLUGIN_ROOT: "/fake/plugin", CLAUDE_CONFIG_DIR: cfg },
    );
    assert.equal(code, 0);
    assert.equal(stdout.trim(), "", `copilot prompt ${i} should not inject`);
  }
  assert.ok(existsSync(join(cfg, "meridian", "state", sid)), "state dir created from sessionId");
  assert.ok(
    !existsSync(join(cfg, "meridian", "state", sid, "router-tick")),
    "copilot should not write router-tick",
  );
  rmSync(cfg, { recursive: true, force: true });
});
