# Scheduling

## Why Almanac doesn't schedule

Scheduling is infrastructure. Your machine already has it: cron, launchd, systemd, Task Scheduler, GitHub Actions. If Almanac shipped a scheduler, it would either duplicate what the OS provides or lock you into a home-directory file nobody asked for.

The plugin stays agnostic. What Almanac provides: a callable command. How it runs: your call.

The command this page schedules, in all examples:

```
/almanac:reflect --lens learning --date yesterday
```

Non-interactive invocation via the `claude` CLI:

```
claude -p "/almanac:reflect --lens learning --date yesterday"
```

## Claude Code scheduling

If your Claude Code setup exposes a scheduling primitive (for example, a plugin or MCP server that registers cron-style jobs), invoke `/almanac:reflect` through that primitive using its own syntax. Consult its docs — Almanac does not ship one and does not assume a specific API.

When in doubt, use an OS-level scheduler below. They are universally available and do not depend on any Claude Code feature. Almanac never stores a schedule registry; you manage entries through whatever tool creates them.

## launchd (macOS)

Write `~/Library/LaunchAgents/com.user.almanac-reflect.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.user.almanac-reflect</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/claude</string>
    <string>-p</string>
    <string>/almanac:reflect --lens learning --date yesterday</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/Users/you/path/to/vault</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>9</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>/tmp/almanac-reflect.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/almanac-reflect.err</string>
</dict>
</plist>
```

Load and start:

```
launchctl load ~/Library/LaunchAgents/com.user.almanac-reflect.plist
```

Unload to stop:

```
launchctl unload ~/Library/LaunchAgents/com.user.almanac-reflect.plist
```

Almanac assumes `cwd` is the vault root; `WorkingDirectory` in the plist is how you guarantee that.

## systemd timer (Linux)

`~/.config/systemd/user/almanac-reflect.service`:

```ini
[Unit]
Description=Almanac daily reflect

[Service]
Type=oneshot
WorkingDirectory=/home/you/path/to/vault
ExecStart=/usr/local/bin/claude -p "/almanac:reflect --lens learning --date yesterday"
```

`~/.config/systemd/user/almanac-reflect.timer`:

```ini
[Unit]
Description=Run almanac-reflect daily at 09:00

[Timer]
OnCalendar=*-*-* 09:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:

```
systemctl --user daemon-reload
systemctl --user enable --now almanac-reflect.timer
```

Inspect:

```
systemctl --user list-timers almanac-reflect.timer
journalctl --user -u almanac-reflect.service
```

## Task Scheduler (Windows)

One-liner from an elevated PowerShell prompt:

```powershell
schtasks /create /tn "AlmanacReflect" /tr "claude -p \"/almanac:reflect --lens learning --date yesterday\"" /sc daily /st 09:00 /sd 01/01/2026
```

Set the task's "Start in" directory to your vault root via Task Scheduler UI, or use `/rp` and a full batch wrapper that `cd`s first.

Remove:

```powershell
schtasks /delete /tn "AlmanacReflect" /f
```

## GitHub Actions

`.github/workflows/almanac-reflect.yml` inside the vault repo:

```yaml
name: almanac-reflect
on:
  schedule:
    - cron: '0 9 * * *'
  workflow_dispatch:

jobs:
  reflect:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - name: Install claude CLI
        run: npm install -g @anthropic-ai/claude-code

      - name: Run reflect
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: claude -p "/almanac:reflect --lens learning --date yesterday"

      - name: Commit note
        run: |
          git config user.name "almanac-bot"
          git config user.email "almanac-bot@users.noreply.github.com"
          git add .
          git diff --cached --quiet || git commit -m "reflect: learning $(date -u +%F)"
          git push
```

Your vault must be a git repo for this workflow. That is your choice; Almanac does not require it.

Session transcripts in `~/.claude/projects/` do not exist in CI — the Action runs reflect against a fresh checkout and whatever transcripts that run produces. If you want to reflect on local transcripts, schedule locally, not in Actions.

## Multiple schedules

Run as many as you want. For example:

- `learning` at 09:00 daily — launchd.
- `pain-points` Mondays at 10:00 — launchd.
- `workflow` the 1st of every month — launchd.
- `regret` manually, whenever.

Almanac stores no state about which schedules exist. You manage them, you see them, you remove them. Each schedule is an independent OS-level entry; losing track of one does not corrupt the others.
