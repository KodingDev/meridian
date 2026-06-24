#!/usr/bin/env node
// Claude-only PreToolUse guard (registered in hooks.json, not the Cursor/Copilot
// configs, which have no PreToolUse). Mechanically enforces two Meridian commit
// principles that otherwise live only in prose: no AI attribution in commit
// messages, and never staging the gitignored .meridian/ working artifacts.
// Anything else proceeds untouched — emitting nothing defers to normal permissions.
import { readInput } from "./lib/signals.mjs";

const ATTRIBUTION = [
  /co-?authored-by:[^\n]*\b(?:claude|anthropic)\b/i,
  /generated with[^\n]*claude/i,
  /🤖\s*generated with/i,
  /claude\.ai\/code/i,
  /claude-session:/i,
];

const STAGES_MERIDIAN = /\bgit\s+(?:add|stage)\b[^&|;]*\.meridian\b/i;

/** @param {string} reason */
function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }) + "\n",
  );
  process.exit(0);
}

const input = readInput();
if (input?.tool_name !== "Bash") process.exit(0);
const command = input?.tool_input?.command;
if (typeof command !== "string") process.exit(0);

if (/\bgit\s+commit\b/i.test(command) && ATTRIBUTION.some((re) => re.test(command))) {
  deny(
    "Meridian: commit messages carry no AI attribution — strip the trailer " +
      "(Co-Authored-By: Claude, 'Generated with Claude', claude.ai/code, or Claude-Session) " +
      "and re-run the commit with a clean message.",
  );
}

if (STAGES_MERIDIAN.test(command)) {
  deny(
    "Meridian: .meridian/ holds local working artifacts and is gitignored — it is never " +
      "staged or committed. Drop the .meridian path from this command.",
  );
}
