---
sidebar_position: 2
sidebar_label: Environment variables
---

# Environment variables

Causly Server is configured through environment variables. You rarely set them by hand:
[`causly-server setup`](./cli.md#setup) and [`causly-server keys`](./cli.md#keys) write them for
you, and [`causly-server init`](./cli.md#init) sets the server-level ones in your editor's config.
This page is the reference for every variable.

All service keys are optional. Files, git, shell, Docker and Terraform work with none of them.

## Where settings are read from

Variables are resolved in this order. The first place that defines a variable wins.

| Priority | Source | Notes |
|---|---|---|
| 1 | The process environment | Variables your editor passes in its MCP config `env` block, or that you set in your terminal. `init --workspace` and `init --toolsets` write here |
| 2 | `~/.causly/.env` | The default settings file. On Windows, `C:\Users\<you>\.causly\.env` |
| 3 | `.env` next to the code | Only when you run from a git checkout |

If `CAUSLY_ENV_FILE` is set, that single file is used instead of priorities 2 and 3.

Changes to the settings file are picked up on the next tool call. You do not need to restart your
editor. Changes to your editor's MCP config (for example `CAUSLY_WORKSPACE`) need an editor
restart.

## Server settings

| Variable | Default | Description |
|---|---|---|
| `CAUSLY_WORKSPACE` | Off | Limit file and path arguments to these folders. Separate several with `;` on Windows or `:` on macOS and Linux. Set it with `causly-server init --workspace <folder>`. See [Security](./security.md) |
| `CAUSLY_TOOLSETS` | Set by `init` | Packs to load at startup, comma-separated, for example `research,pipeline,meetings`. `all` loads every pack. The core packs (`files`, `directory`, `command`, `project`) always load. Manage it with `causly-server toolsets` |
| `CAUSLY_TIMEZONE` | Your computer's zone | IANA timezone name, for example `Asia/Kolkata`. Used for "today", "tomorrow" and working hours in calendar and reminder tools |
| `CAUSLY_HOME` | `~/.causly` | Folder for your settings, logs, secrets store and local database |
| `CAUSLY_ENV_FILE` | None | Use this file as the only settings file |
| `CAUSLY_DB_PATH` | `~/.causly/causly.db` | Location of the local SQLite database |
| `CAUSLY_REMINDER_NOTIFY` | On | Set to `off` to stop due reminders being sent to Telegram. They are still announced in the server log |
| `CAUSLY_UPDATE_CHECK` | On | Set to `off` to stop `status` and `doctor` from checking the npm registry for a newer version |
| `CAUSLY_SEARCH_PROVIDER` | Automatic | Force the `web_search` provider: `tavily` or `duckduckgo`. By default Tavily is used when `TAVILY_API_KEY` is set, otherwise DuckDuckGo. `tavily` without a key returns an error |
| `CAUSLY_ALLOW_PRIVATE_HOSTS` | Off | `web_fetch` refuses private, loopback and link-local addresses. Set to `true` to allow them, for example to read a local dev server |

### Where data is stored

When installed from npm, everything lives in `CAUSLY_HOME` (`~/.causly` by default), so upgrading
the package never touches it:

- `.env`: your keys and settings
- `causly.db`: SQLite database for the pipeline, meetings and reminders
- the encrypted secrets store
- `activity.log`: the structured log of every tool call

Run from a git checkout, logs and the secrets store stay in the repository folder.

## Services

For each service, run `causly-server setup <service>` to be walked through it. The service id is
the name in the first column.

| Service id | Variables | Required | Where to get it |
|---|---|---|---|
| `github` | `GITHUB_TOKEN` | Yes | [Fine-grained token](https://github.com/settings/tokens?type=beta) with Contents, Issues and Pull requests (read and write). Add Administration only for `github_create_repo` and `github_delete_repo` |
| `vercel` | `VERCEL_TOKEN` | Yes | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `supabase` | `SUPABASE_ACCESS_TOKEN` | Yes | [Supabase account tokens](https://supabase.com/dashboard/account/tokens) |
| `slack` | `SLACK_BOT_TOKEN` | Yes | Slack app, OAuth & Permissions. Bot scopes: `channels:read`, `channels:history`, `groups:read`, `groups:history`, `chat:write`, `users:read`. Searching messages needs a user token with `search:read` |
| `notion` | `NOTION_API_KEY` | Yes | [notion.so/my-integrations](https://www.notion.so/my-integrations). Also share each page or database with the integration, or it stays invisible |
| `linear` | `LINEAR_API_KEY` | Yes | Linear, Settings, Account, Security & access, Personal API keys |
| `sentry` | `SENTRY_AUTH_TOKEN` | Yes | [Sentry auth tokens](https://sentry.io/settings/account/api/auth-tokens/) with `project:read` and `event:read`. Add `event:write` to resolve, ignore or comment on issues |
| `telegram` | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Both | Create a bot with [@BotFather](https://t.me/BotFather), press Start on it, then find your chat id with `telegram_get_updates` |
| `research` | `TAVILY_API_KEY` | No | [tavily.com](https://tavily.com), free tier. Gives better `web_search` results. Without it, Causly falls back to DuckDuckGo |
| `groq` | `GROQ_API_KEY` | Yes | [console.groq.com/keys](https://console.groq.com/keys). Free tier available |
| `groq` | `GROQ_WHISPER_MODEL` | No | Transcription model. Default `whisper-large-v3-turbo` |
| `groq` | `GROQ_MAX_FILE_MB` | No | Largest recording uploaded as-is. Default `25`. Larger files are compressed with `ffmpeg` first |
| `gmail` | `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` | All three | See [Google](#google) |
| `calendar` | `CALENDAR_REFRESH_TOKEN` | Yes | See [Google](#google) |
| `calendar` | `CALENDAR_CLIENT_ID`, `CALENDAR_CLIENT_SECRET` | No | Only if you use a different OAuth client from Gmail. Otherwise the `GMAIL_*` client is reused |
| `gsc` | `GSC_REFRESH_TOKEN` | Yes | Search Console. See [Google](#google) |
| `gsc` | `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET` | No | Only if different from the Gmail client |

### Google

Gmail, Calendar and Search Console share one OAuth client that you create once in Google Cloud
Console. The easiest way to finish setup is the browser sign-in:

1. Enable the **Gmail API**, **Google Calendar API** and optionally **Search Console API** in your
   Google Cloud project.
2. Create an OAuth client of type **Desktop app**. A "Web application" client fails with
   `redirect_uri_mismatch`.
3. Save the client id and secret: `causly-server setup gmail`.
4. Run `causly-server login google` (add `all` to include Search Console). It signs you in and
   saves the refresh tokens for you.

Google expires refresh tokens after 7 days while your app is in Testing status. See
[`login google`](./cli.md#login-google).

### Services that need no variable

| Tool group | What it needs |
|---|---|
| Docker | The `docker` CLI on your `PATH`. On Windows it falls back to `wsl docker` if Docker only exists inside WSL |
| Terraform | The `terraform` CLI on your `PATH` |
| Postgres and MySQL | A connection string passed on each call, for example `postgres://user:pass@host:5432/dbname`. Nothing is stored |
| Large recordings | `ffmpeg` on your `PATH`, only for recordings over `GROQ_MAX_FILE_MB` |

## Secrets manager

| Variable | Required | Description |
|---|---|---|
| `SECRETS_MASTER_KEY` | For the secrets tools | A 32-byte key as 64 hex characters. You generate it and keep it |
| `SECRETS_MASTER_KEY_NEW` | Only while rotating | The replacement key during master key rotation. Remove it when rotation is done |

Generate a key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Lose this key and the stored secrets cannot be recovered. See the [Secrets tools](./tools/secrets.md).

## BoundaryAttest

Optional signed receipts for `ship_change`, `verify_ci_fix` and `deploy_project`. Off by default.
See [BoundaryAttest](./tools/boundaryattest.md) for what it does.

| Variable | Default | Description |
|---|---|---|
| `BOUNDARYATTEST_ENABLED` | `false` | Set to `true` to turn receipts on |
| `BOUNDARYATTEST_PRIVATE_KEY` | None | Absolute path to an Ed25519 PKCS #8 PEM private key. Keep it outside the MCP client's reach |
| `BOUNDARYATTEST_RECEIPT_DIR` | None | Absolute path to the folder where receipts are written |
| `BOUNDARYATTEST_TOOLS` | All three | Comma-separated subset of `ship_change`, `verify_ci_fix`, `deploy_project`. It cannot add tools beyond these |

## Checking your configuration

```bash
causly-server keys list       # which keys are set, never the full value
causly-server doctor --test   # live check of every configured service
```
