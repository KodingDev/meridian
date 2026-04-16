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

The right voice depends on what the note is for:

**Reference notes** (research, project docs, anything in `Reference/` or that's meant to be looked up later — including Almanac `investigate` output): direct, authoritative, imperative where appropriate. No first person ("I looked into"), no second person ("you should"). Just state what's true, cite sources inline as markdown links, use code blocks and tables where they help. No trailing "Conclusion" section. No emoji unless the note is explicitly informal.

**Reflection notes about the user's sessions** (Almanac `reflect` output — `learning`, `pain-points`, etc.): second-person observational. "You kept hitting X," "this came up while you were working on Y," "the thing that wore you down was Z." Never first-person-as-the-user — the note is written FOR the user by an attentive observer, not ventriloquizing them. Conversational prose, sentence fragments fine, citations inline.

**Personal daily notes and private journal entries** (`Daily Notes/`, anywhere the user is writing their own thoughts): whatever the user wants. Claude should not be writing these on behalf of the user.

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
