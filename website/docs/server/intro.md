---
slug: /
sidebar_position: 1
sidebar_label: Overview
---

# Causly Server

**Causly Server is an open-source MCP server that turns any AI agent into your technical
co-founder.**

Most agents can write text. Causly Server gives them hands. Through one local
[MCP](https://modelcontextprotocol.io) server, your agent can ship code, hunt for clients, track
deals, take meeting notes, manage your calendar and remind you on Telegram, all from a single
conversation and all on your own machine.

```bash
npm install -g causly-server
causly-server init
```

## Why it exists

A founder's week is not only code. It is also finding clients, following up, remembering what was
promised on a call, and shipping without breaking things. Causly Server puts all of that behind
one server instead of a dozen separate integrations.

- **One server for build, sell, operate and grow.** Git, GitHub, CI and deploys, but also leads, a
  sales pipeline, meeting notes, calendar, reminders and SEO.
- **Memory that survives the chat.** Your pipeline, meetings and reminders live in a local SQLite
  file, so the agent can pick up tomorrow where it stopped today.
- **Local-first.** Keys and data stay on your machine. There is no Causly cloud and no Causly
  account.
- **Safe by default.** Risky actions need explicit confirmation, file access can be limited to one
  folder, and secrets are redacted from logs.
- **Light on your agent's context.** Tools load in packs on demand instead of flooding the agent
  with hundreds of definitions.
- **One command setup.** `init` finds Claude Desktop, Cursor and Windsurf and wires them up.

## What you can ask

- "Find companies hiring React developers and add the best three to my pipeline."
- "Save notes from my call with Acme: they want a demo next week, follow up on Friday."
- "What is due this week? Include meeting action items and reminders."
- "Prep me for my next meeting." (needs Google Calendar)
- "Transcribe this recording and list the action items." (needs a Groq key)
- "Ship this change: run the checks, open a pull request, tell me when CI is green."
- "Audit this page for SEO and suggest keywords."
- "Find a free slot on Thursday and create the event."

## How it works

Your agent talks to Causly Server over MCP on stdio. Inside the server:

1. **Tool router.** `search_tools`, `load_toolset` and `use_tool` let the agent find a tool and
   call it by name. `use_tool` works even in editors that do not refresh their tool list
   mid-chat, so you never need to restart to use a tool.
2. **Safety layer.** Permission levels, confirmation for risky actions, an optional workspace
   limit, secret redaction and an activity log.
3. **Tool packs.** About 230 tools grouped into packs. Everyday packs load at startup, the rest on
   demand.
4. **Local store.** SQLite for pipeline, meetings and reminders in `~/.causly`, an encrypted
   secrets store, and your API keys in `~/.causly/.env`.
5. **Your services.** GitHub, Vercel, Docker, Terraform, Postgres, Slack, Notion, Linear, Gmail,
   Google Calendar, Telegram and more, reached with your own keys.

See [Architecture](./architecture.md) for the full breakdown and [Security](./security.md) for the
safety model.

## What is in the box

| Area | What it covers |
|---|---|
| **Build and ship** | Files, directories, shell, project checks, git, GitHub, Vercel, Docker, Terraform, databases, Supabase |
| **Workflows** | `ship_change`, `fix_ci`, `verify_ci_fix`, `deploy_project`: several steps chained into one verified outcome |
| **Sell and grow** | Web research, lead finding, sales pipeline, meetings, SEO |
| **Operate** | Reminders, calendar, Gmail, Telegram, Slack, Notion, Linear, Sentry |
| **Secrets** | Encrypted local secrets store |

The full list, with every tool, is in [Tool categories](./tools/overview.md).

## Scope today

- **Local and single-user.** Causly Server runs as a process your MCP client starts over stdio.
  There is no separate hosted agent or chat interface. See [Limitations](./limitations.md).
- **Works with any MCP client.** Tested with Claude Desktop, Cursor and Windsurf, a plain
  JavaScript MCP client, and LangChain (JS).
- **Node.js 22.13 or newer.**
- **Open source, MIT licensed.**

## Next steps

- [Quickstart](./getting-started.md): install, connect your editor and run your first request.
- [Tool categories](./tools/overview.md): everything your agent can do.
- [Security](./security.md): what protects your machine.
