#!/usr/bin/env node
// Render a promptfoo result JSON as a Markdown table for the GitHub Actions job
// summary (promptfoo has no markdown output format). Reads the path in argv[2],
// writes the table to stdout.
import { readFileSync } from "node:fs";

const result = JSON.parse(readFileSync(process.argv[2], "utf8"));
const rows = result.results?.results ?? result.results ?? [];

let passed = 0;
const lines = ["| | Prompt | Routed to | Expected |", "|---|---|---|---|"];
for (const row of rows) {
  const prompt = String(row.vars?.prompt ?? "")
    .replace(/\|/g, "\\|")
    .slice(0, 80);
  const got = (row.response?.metadata?.skillCalls ?? []).map((s) => s.name).join(", ") || "(none)";
  const assert = row.testCase?.assert?.[0];
  const want = assert ? (assert.type === "skill-used" ? assert.value : "(none)") : "?";
  if (row.success) passed++;
  lines.push(`| ${row.success ? "✅" : "❌"} | ${prompt} | \`${got}\` | \`${want}\` |`);
}

console.log(`## Routing eval — ${passed}/${rows.length} passed\n`);
console.log(lines.join("\n"));
