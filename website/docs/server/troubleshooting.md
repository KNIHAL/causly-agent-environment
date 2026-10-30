---
sidebar_position: 1
---

# Troubleshooting

Start with the doctor. It checks your setup and tells you what is missing:

```bash
causly-server doctor          # quick check
causly-server doctor --test   # also tests every configured key live
```

## Install and setup

| Problem | Fix |
|---|---|
| `causly-server` is not recognized after install | Open a new terminal so `PATH` refreshes. Check that your npm global folder (`npm config get prefix`) is on `PATH` |
| `npm install` fails with `'node' is not recognized` in a postinstall script (Windows) | Retry with `npm install -g causly-server --ignore-scripts` |
| `doctor` says Node.js is too old | Causly Server needs Node.js 22.13 or newer. Pipeline, meetings and reminders use the built-in `node:sqlite` module |
| `init` says it could not find an editor | Pass one explicitly: `causly-server init --client claude`, `cursor` or `windsurf` |
| `--workspace` is rejected | The folder must already exist |

## Your editor

| Problem | Fix |
|---|---|
| The editor does not show the tools after `init` | Quit the editor completely, including its system tray icon, then open it again |
| The agent cannot see a tool | The tool's pack is not loaded. Ask the agent to call it with `use_tool`, or run `causly-server toolsets add <pack>`. See [How it works](./architecture.md#finding-and-calling-tools) |
| `Blocked: ... requires explicit confirmation` | The tool is `HIGH` or `DESTRUCTIVE`. The agent must call it again with `confirm: true`. Check that you are happy with the action first. See [Permission levels](./security.md#permission-levels) |
| `Blocked: ... is outside the allowed workspace` | A workspace limit is on. Check `causly-server doctor`, or run `causly-server init --workspace <folder>` with the folder you need |
| A tool says a key is missing | The error includes the fix, for example `causly-server setup github`. Run it in a terminal |
| A key change had no effect | Check that the variable is not also set in your editor's MCP config or your terminal, which take priority. `causly-server keys set` warns you when that happens |

## Google (Gmail, Calendar, Search Console)

| Problem | Fix |
|---|---|
| Gmail or Calendar suddenly stopped working | While your Google app is in Testing status, the token expires after 7 days. Run `causly-server login google` |
| `redirect_uri_mismatch` during sign-in | Your OAuth client is a "Web application". Create a **Desktop app** client instead and save it with `causly-server setup gmail` |
| `403` from Google | The token is missing a scope, or the API is not enabled in your Google Cloud project. Enable the Gmail, Calendar or Search Console API, then run `causly-server login google` again |
| `401` from Google | The refresh token is wrong or expired. Run `causly-server login google` |
| Search Console returns no sites | The signed-in account must have access to the property. Run `causly-server login google all` |

## Reminders and Telegram

| Problem | Fix |
|---|---|
| A reminder never reached Telegram | Set both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, then run `causly-server doctor --test`. Also check that `CAUSLY_REMINDER_NOTIFY` is not `off` |
| Reminders only arrive when I open my editor | Reminders are checked while a Causly Server process is running. Anything overdue is sent shortly after the next start |
| `TELEGRAM_CHAT_ID` is missing | Message your bot once, then run `causly-server setup telegram`. It finds your chat id automatically |

## Meetings

| Problem | Fix |
|---|---|
| Transcription fails on a large file | Install [`ffmpeg`](https://ffmpeg.org) and make sure it is on your `PATH`. Files above 25 MB are compressed first |
| `meeting_transcribe` is refused | It uploads audio to Groq, so it needs `confirm: true`. The agent should ask you first |
| Transcription says the key is missing | `causly-server setup groq` |

## Your data

| Problem | Fix |
|---|---|
| `restore` cannot replace the data file | Quit Claude Desktop, Cursor and anything else that uses Causly Server, then run it again |
| Pipeline or meetings say the database is locked | Update to the latest version: `npm update -g causly-server`. Version 1.5.2 fixed this |
| I want to start fresh | Run `causly-server backup` first, then delete `~/.causly/causly.db` |

## Service-specific issues

| Service | Problem | Fix |
|---|---|---|
| GitHub | `403` on pull request or Actions tools | The token needs **Pull requests** and **Actions** permissions (fine-grained) or `repo` and `workflow` scope (classic). See [GitHub setup](./tools/github.md#setup) |
| Vercel | Deployment tools fail | `vercel_create_deployment` and `deploy_project` need the project to be git-linked already. They trigger a deployment, they do not create the link |
| Supabase | `supabase_run_sql` returns `403` | Some personal access tokens restrict raw SQL. Check the token's settings or generate a new one |
| Slack | `slack_search_messages` fails with `not_allowed_token_type` | Searching needs a user token with `search:read`. Bot tokens (`xoxb-`) cannot search. Every other Slack tool works with a bot token |
| Docker | `docker_push` fails | The host needs registry authentication already configured |
| Sentry | `resolve_issue`, `ignore_issue` or `add_comment` fail | The token also needs the `event:write` scope |
| Notion | A page or database is not found | Share it with your integration: open the page, then **Connections**, then add the integration |

## Still stuck?

Search the [GitHub issues](https://github.com/KNIHAL/causly-server/issues). If it is new, open
one with what you expected, what happened (include the error message), your operating system and
your Node.js version. The output of `causly-server doctor` helps. It never prints your keys.
