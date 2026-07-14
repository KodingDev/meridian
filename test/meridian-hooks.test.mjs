import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HOOKS = join(dirname(fileURLToPath(import.meta.url)), "..", "hooks");

function tmpConfig() {
  return mkdtempSync(join(tmpdir(), "meridian-"));
}

/** @param {string} name @param {object | string} payload @param {Record<string, string>} [env] */
function runHook(name, payload, env = {}) {
  const input = typeof payload === "string" ? payload : JSON.stringify(payload);
  try {
    const stdout = execFileSync(process.execPath, [join(HOOKS, name)], {
      input,
      encoding: "utf8",
      env: { ...process.env, ...env },
    });
    return { code: 0, stdout, stderr: "" };
  } catch (error) {
    const failure = /** @type {any} */ (error);
    return {
      code: failure.status ?? 1,
      stdout: String(failure.stdout ?? ""),
      stderr: String(failure.stderr ?? ""),
    };
  }
}

/** @param {string} stdout */
function additionalContext(stdout) {
  return JSON.parse(stdout).hookSpecificOutput.additionalContext;
}

test("session-start emits the professional baseline without guessing a profile", () => {
  const config = tmpConfig();
  const result = runHook(
    "session-start.mjs",
    { hook_event_name: "SessionStart" },
    {
      CLAUDE_CONFIG_DIR: config,
      MERIDIAN_MODEL_PROFILE: "",
    },
  );
  assert.equal(result.code, 0);
  const context = additionalContext(result.stdout);
  assert.match(context, /professional engineering standard/i);
  assert.doesNotMatch(context, /model adapter/i);
  rmSync(config, { recursive: true, force: true });
});

test("session-start selects the exact Opus profile from hook input", () => {
  const config = tmpConfig();
  const result = runHook(
    "session-start.mjs",
    { hook_event_name: "SessionStart", model: "claude-opus-4-8" },
    { CLAUDE_CONFIG_DIR: config, MERIDIAN_MODEL_PROFILE: "" },
  );
  const context = additionalContext(result.stdout);
  assert.match(context, /comment narration/i);
  assert.match(context, /artifact overproduction/i);
  assert.doesNotMatch(context, /review recursion/i);
  rmSync(config, { recursive: true, force: true });
});

test("environment override wins over detected model", () => {
  const config = tmpConfig();
  const result = runHook(
    "session-start.mjs",
    { hook_event_name: "SessionStart", model: "claude-opus-4-8" },
    { CLAUDE_CONFIG_DIR: config, MERIDIAN_MODEL_PROFILE: "fable" },
  );
  const context = additionalContext(result.stdout);
  assert.match(context, /professional engineering standard/i);
  assert.doesNotMatch(context, /model adapter/i);
  rmSync(config, { recursive: true, force: true });
});

test("host-local fallback selects a profile when the hook has no model", () => {
  const config = tmpConfig();
  mkdirSync(join(config, "meridian"), { recursive: true });
  writeFileSync(
    join(config, "meridian", "config.json"),
    JSON.stringify({ fallbackProfile: "sol" }),
  );
  const result = runHook(
    "session-start.mjs",
    { hook_event_name: "SessionStart" },
    {
      CLAUDE_CONFIG_DIR: config,
      MERIDIAN_MODEL_PROFILE: "",
    },
  );
  const context = additionalContext(result.stdout);
  assert.match(context, /review recursion/i);
  assert.match(context, /depth escalation/i);
  assert.match(context, /workflow literalism/i);
  assert.match(context, /agreement seeking/i);
  rmSync(config, { recursive: true, force: true });
});

test("malformed host config degrades to the professional baseline", () => {
  const config = tmpConfig();
  mkdirSync(join(config, "meridian"), { recursive: true });
  writeFileSync(join(config, "meridian", "config.json"), "not json");
  const result = runHook(
    "session-start.mjs",
    {},
    {
      CLAUDE_CONFIG_DIR: config,
      MERIDIAN_MODEL_PROFILE: "",
    },
  );
  assert.match(additionalContext(result.stdout), /professional engineering standard/i);
  assert.doesNotMatch(additionalContext(result.stdout), /model adapter/i);
  rmSync(config, { recursive: true, force: true });
});

test("session-start re-emits behavior context after compaction", () => {
  const config = tmpConfig();
  const result = runHook(
    "session-start.mjs",
    { hook_event_name: "SessionStart", source: "compact", model: "claude-opus-4-8" },
    { CLAUDE_CONFIG_DIR: config, MERIDIAN_MODEL_PROFILE: "" },
  );
  assert.match(additionalContext(result.stdout), /comment narration/i);
  rmSync(config, { recursive: true, force: true });
});

test("session-start emits the Codex context shape", () => {
  const config = tmpConfig();
  const result = runHook(
    "session-start.mjs",
    { hook_event_name: "SessionStart", model: "unknown" },
    {
      PLUGIN_ROOT: "/fake/plugin",
      CLAUDE_PLUGIN_ROOT: "/fake/plugin",
      CODEX_HOME: config,
      MERIDIAN_MODEL_PROFILE: "",
    },
  );
  const output = JSON.parse(result.stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, "SessionStart");
  assert.match(output.hookSpecificOutput.additionalContext, /professional engineering standard/i);
  rmSync(config, { recursive: true, force: true });
});

test("session-start emits Cursor additional_context", () => {
  const config = tmpConfig();
  const result = runHook(
    "session-start.mjs",
    { hook_event_name: "sessionStart", model_id: "claude-opus-4-8" },
    {
      CURSOR_PLUGIN_ROOT: "/fake/plugin",
      CLAUDE_CONFIG_DIR: config,
      MERIDIAN_MODEL_PROFILE: "",
    },
  );
  const output = JSON.parse(result.stdout);
  assert.match(output.additional_context, /comment narration/i);
  assert.equal(output.hookSpecificOutput, undefined);
  rmSync(config, { recursive: true, force: true });
});

test("session-start emits Copilot additionalContext", () => {
  const config = tmpConfig();
  const result = runHook(
    "session-start.mjs",
    { hook_event_name: "sessionStart" },
    {
      COPILOT_PLUGIN_ROOT: "/fake/plugin",
      COPILOT_HOME: config,
      MERIDIAN_MODEL_PROFILE: "sol",
    },
  );
  const output = JSON.parse(result.stdout);
  assert.match(output.additionalContext, /review recursion/i);
  assert.equal(output.hookSpecificOutput, undefined);
  assert.equal(output.additional_context, undefined);
  rmSync(config, { recursive: true, force: true });
});

test("session-start survives malformed hook input", () => {
  const config = tmpConfig();
  const result = runHook("session-start.mjs", "not json", {
    CLAUDE_CONFIG_DIR: config,
    MERIDIAN_MODEL_PROFILE: "",
  });
  assert.equal(result.code, 0);
  assert.match(additionalContext(result.stdout), /professional engineering standard/i);
  rmSync(config, { recursive: true, force: true });
});

test("session-start emits a single-line JSON payload", () => {
  const config = tmpConfig();
  const result = runHook(
    "session-start.mjs",
    {},
    {
      CLAUDE_CONFIG_DIR: config,
      MERIDIAN_MODEL_PROFILE: "",
    },
  );
  assert.ok(result.stdout.endsWith("\n"));
  assert.ok(!result.stdout.trimEnd().includes("\n"));
  rmSync(config, { recursive: true, force: true });
});

test("pre-tool-use denies AI attribution and staging Meridian artifacts", () => {
  for (const command of [
    'git commit -m "feat: x\n\nCo-Authored-By: Claude <noreply@anthropic.com>"',
    "git commit -m 'fix: y' -m 'Claude-Session: https://claude.ai/code/abc'",
    "git add .meridian/specs/x.md",
    "git stage .meridian/audits/a.md",
  ]) {
    const result = runHook("pre-tool-use.mjs", {
      tool_name: "Bash",
      tool_input: { command },
    });
    assert.equal(result.code, 0);
    assert.equal(JSON.parse(result.stdout).hookSpecificOutput.permissionDecision, "deny", command);
  }
});

test("pre-tool-use allows clean commits and unrelated commands", () => {
  for (const command of [
    'git commit -m "feat: add model profile"',
    "git add src/index.ts",
    "git add .",
    "npm test",
  ]) {
    const result = runHook("pre-tool-use.mjs", {
      tool_name: "Bash",
      tool_input: { command },
    });
    assert.equal(result.code, 0);
    assert.equal(result.stdout.trim(), "", command);
  }
});

test("hook manifests expose only session behavior and the existing commit guard", () => {
  const shared = JSON.parse(readFileSync(join(HOOKS, "hooks.json"), "utf8"));
  assert.deepEqual(Object.keys(shared.hooks).sort(), ["PreToolUse", "SessionStart"]);

  const cursor = JSON.parse(readFileSync(join(HOOKS, "hooks-cursor.json"), "utf8"));
  assert.deepEqual(Object.keys(cursor.hooks), ["sessionStart"]);

  const copilot = JSON.parse(readFileSync(join(HOOKS, "hooks-copilot.json"), "utf8"));
  assert.deepEqual(Object.keys(copilot.hooks), ["sessionStart"]);
});

test("hook commands resolve existing scripts without command args", () => {
  const shared = JSON.parse(readFileSync(join(HOOKS, "hooks.json"), "utf8"));
  for (const matchers of Object.values(shared.hooks)) {
    for (const matcher of matchers) {
      for (const hook of matcher.hooks) {
        assert.equal(hook.args, undefined);
        assert.doesNotMatch(hook.command, /\$\{[A-Z_]+\}/);
        assert.doesNotMatch(hook.command, /import\(|pathToFileURL/);
        assert.match(
          hook.command,
          /process\.env\.CLAUDE_PLUGIN_ROOT\s*\|\|\s*process\.env\.PLUGIN_ROOT/,
        );
        assert.match(hook.command, /if\(!r\)process\.exit\(0\)/);
        assert.doesNotMatch(hook.command, /\\/);
        assert.match(hook.command, /wslpath[\s\S]*\/mnt\//);
        const path = hook.command.match(/\/(hooks\/[\w-]+\.mjs)'/)?.[1];
        assert.ok(
          path && existsSync(join(HOOKS, "..", path)),
          `existing script for ${hook.command}`,
        );
      }
    }
  }
});

test("SessionStart command runs outside the plugin working directory", () => {
  const pluginRoot = join(HOOKS, "..");
  const shared = JSON.parse(readFileSync(join(HOOKS, "hooks.json"), "utf8"));
  const command = shared.hooks.SessionStart[0].hooks[0].command;

  for (const rootVar of ["CLAUDE_PLUGIN_ROOT", "PLUGIN_ROOT"]) {
    const config = tmpConfig();
    /** @type {Record<string, string | undefined>} */
    const env = {
      ...process.env,
      CLAUDE_CONFIG_DIR: config,
      MERIDIAN_MODEL_PROFILE: "fable",
    };
    delete env.CLAUDE_PLUGIN_ROOT;
    delete env.PLUGIN_ROOT;
    delete env.COPILOT_PLUGIN_ROOT;
    delete env.CURSOR_PLUGIN_ROOT;
    env[rootVar] = pluginRoot;
    const output = execSync(command, {
      cwd: tmpdir(),
      input: JSON.stringify({ hook_event_name: "SessionStart" }),
      encoding: "utf8",
      env,
    });
    assert.match(additionalContext(output), /professional engineering standard/i);
    rmSync(config, { recursive: true, force: true });
  }
});

test("shared hooks exit cleanly without a plugin root", () => {
  const shared = JSON.parse(readFileSync(join(HOOKS, "hooks.json"), "utf8"));
  for (const matchers of Object.values(shared.hooks)) {
    for (const matcher of matchers) {
      for (const hook of matcher.hooks) {
        /** @type {Record<string, string | undefined>} */
        const env = { ...process.env };
        delete env.CLAUDE_PLUGIN_ROOT;
        delete env.PLUGIN_ROOT;
        delete env.COPILOT_PLUGIN_ROOT;
        delete env.CURSOR_PLUGIN_ROOT;
        let code = 0;
        try {
          execSync(hook.command, { cwd: tmpdir(), input: "{}", encoding: "utf8", env });
        } catch (error) {
          code = /** @type {any} */ (error).status ?? 1;
        }
        assert.equal(code, 0, hook.command);
      }
    }
  }
});

test("Copilot manifest redirects to its hooks config", () => {
  const manifest = JSON.parse(readFileSync(join(HOOKS, "..", ".plugin", "plugin.json"), "utf8"));
  assert.ok(existsSync(join(HOOKS, "..", manifest.hooks)));
});
