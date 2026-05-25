#!/usr/bin/env node
import { rmSync } from "node:fs";
import { readHookInput, safeSessionId, sessionDir } from "./lib.mjs";

const sessionId = safeSessionId(readHookInput());
if (!sessionId) process.exit(0);

// safeSessionId validated this to a single path segment, so rmSync can only
// ever target a dir directly under the Meridian state root.
rmSync(sessionDir(sessionId), { recursive: true, force: true });
