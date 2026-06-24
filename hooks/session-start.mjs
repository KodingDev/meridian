#!/usr/bin/env node
import { detectHost, emitContextFile } from "./lib/host.mjs";
import { readInput, sessionId } from "./lib/signals.mjs";
import { pruneStale } from "./lib/state.mjs";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const host = detectHost();
pruneStale(host, sessionId(readInput()), SEVEN_DAYS_MS);
// Fires on every SessionStart source — including `compact`, which restores the routing table after compaction drops the originally-injected orientation.
emitContextFile(host, "SessionStart", "orientation.md");
