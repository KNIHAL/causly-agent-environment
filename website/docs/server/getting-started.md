---
sidebar_position: 2
sidebar_label: Quickstart
---

# Quickstart

Install Causly Server, connect your editor and run your first request in about five minutes.

## Requirements

- **Node.js 22.13 or newer.** Check with `node --version`.
- An MCP client: Claude Desktop, Cursor, Windsurf, Claude Code, or any client that can start a
  stdio MCP server.

You do not need any API keys to start. Files, git, shell, Docker and Terraform work without keys.
Add keys later for the services you want.

## 1. Install

```bash
npm install -g causly-server
```

Prefer not to install globally? Run `npx causly-server init` instead. In that case `init`
registers the server with your editor as `npx -y causly-server`, so it keeps working after the
temporary npx cache is cleaned.

## 2. Connect your editor

```bash
causly-server init
```

`init` does the following:

- Finds which of **Claude Desktop**, **Cursor** and **Windsurf** are installed (it looks for their
  config folders) and adds Causly Server to each. If none is found, it sets up Claude Desktop.
- Keeps every other MCP server in those config files. If a config file already exists, it saves a
  copy named `<file>.backup-<timestamp>` first.
- Creates `~/.causly/.env` for your API keys, if you do not have one.
- Sets the packs that load at startup: `research`, `leads`, `seo`, `pipeline`, `reminders` and
  `meetings`.
- Prints the one-line command to add it to **Claude Code**.
- Offers to add API keys now.

Then **quit your editor completely and open it again** (including the system tray icon, for
Claude Desktop).

| Client | Config file written by `init` |
|---|---|
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json` |
| Claude Desktop (macOS) | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Linux) | `~/.config/Claude/claude_desktop_config.json` |
| Cursor | `~/.cursor/mcp.json` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |
| Claude Code | Not written. `init` prints `claude mcp add causly-server -- ...` for you to run |

### Init options

```bash
causly-server init --client cursor                          # choose editors instead of auto-detecting
causly-server init --workspace D:\my-project                # limit file tools to one folder
causly-server init --toolsets research,pipeline,meetings    # choose the packs that load at startup
causly-server init --no-setup                               # do not offer to add keys afterwards
```

Re-running `init` is safe. It updates the existing entry instead of adding a second one.

We recommend `--workspace`. With it, file and command tools cannot touch anything outside that
folder. See [Security](./security.md).

## 3. Check your setup

```bash
causly-server doctor
```

`doctor` prints one line per check:

```text
ok    Node.js: 22.13.0
ok    Settings file: C:\Users\you\.causly\.env
ok    Integrations configured: GitHub, Telegram
warn  ffmpeg (large recordings): not found; only needed for recordings over 25 MB
warn  Workspace limit: off: file tools can reach any folder
ok    Set up in: Claude Desktop, Cursor
```

A `warn` is information, not an error. Only a missing Node.js or settings file makes `doctor` exit
with an error.

## 4. Add keys for the services you use (optional)

```bash
causly-server setup
```

`setup` walks you through each service and checks every key live as you enter it. To add one
service only, run `causly-server setup github`. Changes apply immediately. You do not need to
restart your editor.

To verify everything later:

```bash
causly-server doctor --test
```

Gmail and Calendar use a browser sign-in instead of a pasted key: `causly-server login google`.
See the [CLI reference](./cli.md).

## 5. Ask your first question

Open your editor and try one of these:

- "Find companies hiring React developers and add the best three to my pipeline."
- "Save notes from my call with Acme: they want a demo next week, follow up on Friday."
- "What is due this week? Include meeting action items and reminders."

If your agent says it cannot find a tool, ask it to call the tool with `use_tool`, or add the
pack to startup with `causly-server toolsets add <pack>`.

## Updating and removing

```bash
npm update -g causly-server       # update
causly-server remove              # take it out of your editors
npm uninstall -g causly-server    # uninstall
```

`remove` leaves `~/.causly` (your keys and data) alone. Delete that folder yourself if you want
them gone.

## Something not working?

Start with `causly-server doctor`, then see [Troubleshooting](./troubleshooting.md).
