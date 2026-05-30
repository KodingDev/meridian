#!/usr/bin/env node
import { detectHost, emitContextFile } from "./lib/host.mjs";
import { auditDue, isFailureSignal, readInput, sessionId } from "./lib/signals.mjs";
import { tick, touch } from "./lib/state.mjs";

const AUDIT_EVERY = 8;

const host = detectHost();
const input = readInput();
const id = sessionId(input);
if (!id) process.exit(0);

touch(host, id);

// Cursor has no UserPromptSubmit context injection; state is still tracked above.
if (!host.supportsContext("UserPromptSubmit")) process.exit(0);

const count = tick(host, id);

// A terse failure reply means the last fix didn't land — nudge toward root-cause
// before more patching, ahead of the periodic routing audit.
if (isFailureSignal(input.prompt)) {
  emitContextFile(host, "UserPromptSubmit", "debug-reroute.md");
} else if (auditDue(count, AUDIT_EVERY)) {
  emitContextFile(host, "UserPromptSubmit", "routing-audit.md");
}
