---
version: 1
daily-notes: Daily Notes/
reflect-output: Learning/
investigate-output: Reference/
tag-style: flat                # flat | nested
date-format: YYYY-MM-DD
wiki-link-style: title         # title | path
heading-style: atx             # atx (#) | setext (===)
frontmatter-template: |
  tags: {{tags}}
  date: {{date}}
  # user may add custom fields here; scribe preserves unknown keys
---

# Almanac config for this vault

Edit freely. Delete this file to force re-detection on next `almanac:init`.

This file is safe to commit. It contains only vault-relative paths and user-chosen conventions — no absolute paths, no machine IDs, no secrets.

## Fields

- **version** — config schema version. Do not edit.
- **daily-notes** — folder for daily notes. Used by lenses that reference daily notes.
- **reflect-output** — folder where `reflect` writes notes.
- **investigate-output** — folder where `investigate` writes notes.
- **tag-style** — `flat` (`#tag`) or `nested` (`#parent/child`).
- **date-format** — strftime-style format for dates in frontmatter and filenames.
- **wiki-link-style** — `title` (`[[Note Title]]`) or `path` (`[[folder/Note Title]]`).
- **heading-style** — `atx` (`# Heading`) or `setext` (`Heading\n=======`).
- **frontmatter-template** — YAML block prepended to new notes. `{{tags}}` and `{{date}}` are substituted at write time. Unknown keys are preserved.

## Missing fields

If a skill needs a setting that isn't here, it will ask — it will not silently default. Re-run `/almanac:init --edit FIELD` to add one interactively.
