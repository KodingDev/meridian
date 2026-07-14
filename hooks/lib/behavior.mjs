import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_BEHAVIOR_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "behavior");
const ADAPTER_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** @typedef {{ profiles: Record<string, string[]>, modelMatches: Array<{ exact?: string, prefix?: string, profile: string }> }} Registry */

/** @param {unknown} value */
function nonEmptyString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** @param {import("./types.mjs").HookInput} input */
export function activeModel(input) {
  return nonEmptyString(input.model_id) ?? nonEmptyString(input.model);
}

/** @param {Registry} registry @param {string} profile */
function hasProfile(registry, profile) {
  return Object.hasOwn(registry.profiles, profile) && Array.isArray(registry.profiles[profile]);
}

/** @param {Registry} registry @param {string | null} environmentProfile @param {string | null} model @param {string | null} fallbackProfile */
export function resolveProfile(registry, environmentProfile, model, fallbackProfile) {
  if (environmentProfile !== null) {
    return hasProfile(registry, environmentProfile) ? environmentProfile : null;
  }

  if (model !== null) {
    const exact = registry.modelMatches.find((entry) => entry.exact === model);
    if (exact) return hasProfile(registry, exact.profile) ? exact.profile : null;

    const family = registry.modelMatches.find(
      (entry) => typeof entry.prefix === "string" && model.startsWith(entry.prefix),
    );
    if (family) return hasProfile(registry, family.profile) ? family.profile : null;
  }

  if (fallbackProfile !== null) {
    return hasProfile(registry, fallbackProfile) ? fallbackProfile : null;
  }

  return null;
}

/** @param {string} stateBase */
export function readFallbackProfile(stateBase) {
  try {
    const config = JSON.parse(readFileSync(join(stateBase, "meridian", "config.json"), "utf8"));
    return nonEmptyString(config?.fallbackProfile);
  } catch {
    return null;
  }
}

/** @param {string} standard @param {string[]} adapters */
export function composeBehavior(standard, adapters) {
  return [standard, ...adapters]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
}

/** @param {{ input: import("./types.mjs").HookInput, stateBase: string, environmentProfile?: string, behaviorDir?: string }} options */
export function loadBehaviorContext(options) {
  const behaviorDir = options.behaviorDir ?? DEFAULT_BEHAVIOR_DIR;
  const standard = readFileSync(join(behaviorDir, "professional-engineering.md"), "utf8");

  try {
    const registry = /** @type {Registry} */ (
      JSON.parse(readFileSync(join(behaviorDir, "profiles.json"), "utf8"))
    );
    if (!registry.profiles || !Array.isArray(registry.modelMatches)) return standard.trim();

    const environmentProfile = nonEmptyString(options.environmentProfile);
    const fallbackProfile = readFallbackProfile(options.stateBase);
    const profile = resolveProfile(
      registry,
      environmentProfile,
      activeModel(options.input),
      fallbackProfile,
    );
    if (profile === null) return standard.trim();

    const adapters = registry.profiles[profile].map((id) => {
      if (!ADAPTER_ID.test(id)) throw new Error(`Invalid adapter id: ${id}`);
      return readFileSync(join(behaviorDir, "adapters", `${id}.md`), "utf8");
    });
    return composeBehavior(standard, adapters);
  } catch {
    return standard.trim();
  }
}
