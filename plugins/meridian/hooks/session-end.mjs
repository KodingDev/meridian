#!/usr/bin/env node
import { rmSync } from "node:fs";
import { readHookInput, safeSessionId, sessionDir } from "./lib.mjs";

const sessionId = safeSessionId(readHookInput());
if (!sessionId) process.exit(0);

// safeSessionId guarantees a UUID-shaped name, so this rm -rf can only ever
// target a dir directly under the Meridian state root.
rmSync(sessionDir(sessionId), { recursive: true, force: true });
