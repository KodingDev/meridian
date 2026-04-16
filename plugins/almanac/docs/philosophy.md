# Philosophy

Almanac is a notebook helper. It inspects your vault, takes notes, and helps you reflect. It is not a framework, a coach, or a productivity system. The thinking is yours.

## Detect, don't dictate

On `init`, Almanac inspects the vault: folder structure, frontmatter conventions, tag style, date formats. It asks you to confirm what it found. It never forces `_Inbox/`, `Learning/`, or any other folder onto a vault that doesn't already have them.

If your vault uses `kebab-case` tags, Almanac uses `kebab-case`. If you write daily notes as `2026-04-16.md`, reflect output matches. If there is no existing convention, Almanac asks and records your answer in `.almanac.md`.

The plugin adapts to you. You do not adapt to the plugin.

## Data before opinion

Primitives return structured data and write files. `history` emits YAML. `scribe` writes notes to the folder you configured. Neither contains an editorial layer.

Opinions live in lenses. Lenses are user-editable markdown files with a YAML header and a prompt body. If you disagree with a built-in lens, copy it to `~/.almanac/lenses/<name>.md` and rewrite it. Your file shadows the built-in.

The split matters. Primitives are mechanical. Lenses are taste. Mixing them produces a plugin that dictates taste, which is the thing Almanac refuses to be.

## Research is confrontational

`investigate` does not summarize consensus. It searches for dissent, engages it as an argument worth sitting with, and asks "in what situation does this apply — and not?" A research note that only cites agreement fails the bar.

The default query shapes include explicit phrases like `"<topic>" criticism`, `"<topic>" limitations`, `alternatives to "<topic>"`, and `"<topic>" considered harmful`. The skill requires at least one dissenting citation before it will save.

The output is written as a working technical reference, not a templated essay — direct, authoritative, citations woven inline as markdown links. No first-person narration, no second-person coaching, no pre-fab section scaffolding. Consensus is cheap. Dissent is where thinking happens.

## The user is the intelligence

Almanac is scaffolding. It gives you paper, good lighting, and a sharpened pencil. The reasoning, the synthesis, the judgment — yours.

If a reflect note just restates what you already knew, the lens is wrong, not the ink. Rewrite the lens. Ask sharper questions. Almanac does not improve your thinking by running more often; it improves by your editing the lens until the output is worth reading.

## What Almanac does not do

- Does not write outside the vault.
- Does not manage scheduling (see `scheduling.md`).
- Does not cache session data.
- Does not impose folder taxonomies.
- Does not teach — it reflects.
- Does not send transcript text to web searches.
- Does not walk upward to find a vault. `cwd` is the vault root, or the command fails.
