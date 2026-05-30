#!/usr/bin/env node
import { detectHost, emitContextFile } from "./lib/host.mjs";
import { readInput, sessionId } from "./lib/signals.mjs";
import { pruneStale } from "./lib/state.mjs";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const host = detectHost();
pruneStale(host, sessionId(readInput()), SEVEN_DAYS_MS);
emitContextFile(host, "SessionStart", "orientation.md");
