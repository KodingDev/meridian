import { readFileSync } from "node:fs";

/** @returns {import("./types.mjs").HookInput} */
export function readInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}
