#!/usr/bin/env node
import { loadBehaviorContext } from "./lib/behavior.mjs";
import { detectHost } from "./lib/host.mjs";
import { readInput } from "./lib/signals.mjs";

const host = detectHost();
const input = readInput();

try {
  const context = loadBehaviorContext({
    input,
    stateBase: host.stateBase,
    environmentProfile: process.env.MERIDIAN_MODEL_PROFILE,
  });
  host.emit(context);
} catch (error) {
  process.stderr.write(`Meridian could not load its professional standard: ${String(error)}\n`);
}
