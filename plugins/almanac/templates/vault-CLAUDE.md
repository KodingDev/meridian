# Vault guide for Claude

This is an Obsidian vault. When writing notes here, follow these conventions.

## File locations

- Daily notes: `Daily Notes/` named `YYYY-MM-DD.md`
- Reflected notes (Almanac output): `Learning/`
- Research notes (Almanac output): `Reference/`
- Inbox for unsorted notes: `Inbox/`

Adjust the above to match your vault. Almanac reads `.almanac.md` for its own conventions; this file is for everything else.

## Frontmatter

All notes have YAML frontmatter:

    ---
    tags: [tag1, tag2]
    date: YYYY-MM-DD
    ---

Tags are `flat` style (`#tag`, not `#parent/child`). Date is ISO format.

## Links

- Wiki links use title form: `[[Note Title]]` (not paths).
- External links use standard markdown: `[text](url)`.

## Headings

- ATX style (`# Heading`), not setext.
- One `#` heading per note, at the top, matching the filename.

## Writing style

- Direct prose. Short paragraphs. Lists where they help.
- No emoji unless the note is explicitly informal.
- Code blocks fenced with language tags.
- No trailing "Conclusion" sections on reference notes.

## What NOT to do

- Do not create new top-level folders without asking.
- Do not reorganize existing notes.
- Do not write outside this vault.
- Do not edit `.almanac.md` directly — use `/almanac:init --edit FIELD`.

## Almanac skills

If the user asks about session reflection, research notes, or "what did I do this week", route to Almanac:

- `/almanac:reflect --lens learning` — session reflection
- `/almanac:investigate "topic"` — research note with dissent
- `/almanac:history --date yesterday` — raw session data

See the Almanac plugin README for more.
