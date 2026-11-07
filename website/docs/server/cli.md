---
sidebar_position: 1
sidebar_label: CLI reference
---

# CLI reference

The `causly-server` command starts the server and manages your setup.

```text
causly-server [command] [options]
```

Run with no command, `causly-server` starts the MCP server over stdio. This is what your editor
runs. You normally never start it by hand.

| Command | What it does |
|---|---|
| [`init`](#init) | Add Causly Server to Claude Desktop, Cursor and Windsurf |
| [`status`](#status) | One-screen overview of your setup |
| [`doctor`](#doctor) | Check your setup, optionally test every key live |
| [`setup`](#setup) | Add API keys step by step |
| [`keys`](#keys) | List, set or remove individual keys |
| [`login google`](#login-google) | Sign in to Google in your browser |
| [`toolsets`](#toolsets) | Choose which packs load at startup |
| [`backup`](#backup-and-restore) | Save a copy of your pipeline, meetings and reminders |
| [`restore`](#backup-and-restore) | Put a backup back |
| [`remove`](#remove) | Take Causly Server out of your editors |

`causly-server --version` prints the installed version. `causly-server --help` prints the help.

## Where settings live

Your API keys and settings are stored in `~/.causly/.env` (on Windows,
`C:\Users\<you>\.causly\.env`), on your computer only. Use the commands below instead of editing
the file by hand. Key changes are picked up without restarting your editor.

A variable set in your editor's MCP config (for example `CAUSLY_WORKSPACE`) or in your terminal
takes priority over the same variable in the settings file.

When you run Causly Server from a git checkout, the `.env` next to the code is used instead.

## init

Set up Causly Server in your editors.

```bash
causly-server init [--client <list>] [--workspace <folder>] [--toolsets <list>] [--no-setup]
```

| Option | Description |
|---|---|
| `--client` | `claude`, `cursor`, `windsurf`, a comma-separated list of those, or `all`. Default: auto-detect installed editors |
| `--workspace <folder>` | Limit file and command tools to this folder. The folder must exist |
| `--toolsets <list>` | Packs to load at startup, for example `research,pipeline,meetings`. Default: `research,leads,seo,pipeline,reminders,meetings` |
| `--no-setup` | Do not offer to add API keys afterwards |

What it does:

- Writes the server entry into each editor's config file and keeps all other servers. An existing
  file is first copied to `<file>.backup-<timestamp>`. The copy is owner-only, and the config
  file is replaced safely (it keeps its permissions and is never left half written).
- Creates `~/.causly/.env` if it does not exist, readable only by you on macOS and Linux.
- Prints the `claude mcp add ...` command for Claude Code.
- In an interactive terminal, asks whether to add API keys now.

Running `init` again updates the existing entry. Restart the editor afterwards.

## status

```bash
causly-server status
```

Shows, on one screen:

- **Editors** that have Causly Server, how many packs load at startup, and whether file access is
  limited to a folder.
- **Keys** that are ready, and any that are incomplete.
- **Google**: a line only when your Google sign-in is 5 days old or more, because a Testing-status
  app's sign-in expires after 7 days. It says how many days are left, or that it has expired. Not
  shown once `CAUSLY_GOOGLE_PUBLISHED` is `true`.
- **Your data**: companies and open deals in the pipeline, meetings, open and overdue action
  items, pending and overdue reminders, and the next reminder.
- **Backup**: when you last saved one.
- **Updates**: whether a newer version is available.

## doctor

```bash
causly-server doctor [--test]
```

Checks:

| Check | Fails when |
|---|---|
| Node.js | Version is older than 20. Below 22.13 it warns that pipeline, meetings and reminders need 22.13+ |
| Settings file | No `.env` was found |
| Integrations configured | Informational: lists services that have all their keys set |
| Google sign-in | Warns when the sign-in is 5 days old or more (it expires after 7 days in Testing status), and says when it has expired. Shown only when Causly knows the date it was saved. With `CAUSLY_GOOGLE_PUBLISHED=true` it just says the app is marked published |
| ffmpeg | Informational: only needed for recordings over 25 MB |
| Private data folder | Informational: warns when other users could open Causly's data folder (a folder that is not `0700` on macOS and Linux, or outside your profile on Windows) |
| Child process env | Informational: shows whether commands get a minimal environment, extra passthrough names, or the full environment (`*`) |
| Workspace limit | Informational: shows whether file tools are limited to a folder |
| Set up in | Informational: shows which editors have Causly Server |

The command exits with an error only when Node.js or the settings file check fails.

With `--test`, doctor also contacts every configured service and reports `ok` or `FAIL` for each.
It exits with an error if any live check fails.

## setup

```bash
causly-server setup [service]
```

Adds API keys step by step. Each key is checked live as you enter it. Pass a service name, such as
`github` or `linear`, to set up just that one.

## keys

```bash
causly-server keys list
causly-server keys set NAME
causly-server keys unset NAME
causly-server keys open
```

| Subcommand | Description |
|---|---|
| `list` | Show which keys are set. Never prints the full value |
| `set NAME` | Set one key. Uses a hidden prompt, or read the value from a pipe |
| `unset NAME` | Remove a key |
| `open` | Open the settings file in an editor |

If the same variable is also set in your editor config or terminal, `set` and `unset` tell you,
because that value would still win.

## login google

```bash
causly-server login google [gmail,calendar,gsc | all]
```

Signs in to Google in your browser and saves the refresh token. Needed for Gmail, Google Calendar
and Search Console.

| Argument | Services |
|---|---|
| none | Gmail and Calendar |
| `gmail`, `calendar`, `gsc` | The ones you list, comma-separated |
| `all` | Gmail, Calendar and Search Console |

Before the first login, save your Google OAuth client with `causly-server setup` or
`causly-server keys set GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET`. The client must be a
**Desktop app** client. A "Web application" client fails with `redirect_uri_mismatch`.

While your Google app is in Testing mode, Google expires the token after 7 days. The command saves
the date next to each token and prints the day it would stop working, and `status` and `doctor`
warn from day 5. Run `causly-server login google` again to renew it. Publishing the app to
production removes the expiry: see
[Publish your Google app](./tools/gmail.md#publish-your-google-app-stop-the-7-day-expiry).

The command exits with an error if nothing was saved or any check failed. Only `login google`
exists. Other services use `causly-server setup <service>`.

## toolsets

Choose which packs load when your editor starts Causly Server.

```bash
causly-server toolsets                       # show what loads at startup
causly-server toolsets add github,calendar   # load more packs at startup
causly-server toolsets remove seo            # stop loading a pack at startup
causly-server toolsets reset                 # back to the defaults
```

Packs not loaded at startup are still available. Your agent can call any tool with `use_tool`, or
load a pack with `load_toolset`. Startup packs matter because some editors, such as Claude Desktop,
do not refresh their tool list mid-chat.

The default startup packs are `research`, `leads`, `seo`, `pipeline`, `reminders` and `meetings`.
The core packs (`files`, `directory`, `command`, `project`) are always available.

## backup and restore

```bash
causly-server backup [file]
causly-server restore <file> [--yes]
```

`backup` saves your pipeline, meetings and reminders to a file. API keys are **not** included,
they stay in the settings file. The backup is readable only by you on macOS and Linux. It appears
under its final name only when it is complete, so a crash never leaves a half-written backup. A
restored data file is owner-only too.

`restore` replaces your current data with the backup. A copy of the current data is kept and its
path is printed. It asks for confirmation unless you pass `--yes`. Restart your editor afterwards
so running tools reopen the data. If restore cannot replace the data file, quit every app that
uses Causly Server and run it again.

## remove

```bash
causly-server remove [--client <name>]
```

Removes the Causly Server entry from your editors, or only from the editor you name. The config
file is backed up first. Your settings and data in `~/.causly` are left alone.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | An error, a failed check, or an unknown command |
| `130` | You cancelled a prompt |
