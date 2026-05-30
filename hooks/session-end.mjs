#!/usr/bin/env node
import { detectHost } from "./lib/host.mjs";
import { readInput, sessionId } from "./lib/signals.mjs";
import { clear } from "./lib/state.mjs";

const host = detectHost();
const id = sessionId(readInput());
if (id) clear(host, id);
