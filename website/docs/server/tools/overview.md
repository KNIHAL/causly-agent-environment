---
sidebar_position: 0
sidebar_label: Overview
---

# Tools overview

Causly Server has 245 tools in 28 packs. A pack is a group of tools for one integration or job.
Packs load lazily, so your agent only carries the tools it needs. See
[How it works](../architecture.md#tool-packs-and-lazy-loading). The default set costs about 3,600 tokens of context; all packs together about 36,000.

Every tool has a [risk level](../security.md#permission-levels). `HIGH` and `DESTRUCTIVE` tools
need `confirm: true`.

## Which packs load when

| Loads | Packs |
|---|---|
| **Always** (core) | `files`, `directory`, `command`, `project` |
| **At startup** (set by `init`) | `research`, `leads`, `seo`, `pipeline`, `reminders`, `meetings` |
| **On demand** | Everything else. Your agent loads them with `load_toolset` or calls tools directly with `use_tool`. Or add them to startup with `causly-server toolsets add <pack>` |

Three router tools are always available: `search_tools`, `load_toolset` and `use_tool`.

## Core

| Pack | Tools | What it does |
|---|---|---|
| [Files, git, shell and project](./filesystem-git-shell.md) | 42 | Read, write and edit files, directories, local git, shell commands, and project-aware test, lint and build |
| [Workflow](./workflow-tools.md) | 4 | `ship_change`, `fix_ci`, `verify_ci_fix` and `deploy_project`: several steps chained into one verified outcome |

## Development and infrastructure

| Pack | Tools | What it does | Needs |
|---|---|---|---|
| [GitHub](./github.md) | 27 | Repos, issues, pull requests, reviews and Actions | `GITHUB_TOKEN` |
| [Docker](./docker.md) | 18 | Build, run, logs, images, exec and Compose | `docker` CLI |
| [Terraform](./terraform.md) | 20 | Init, plan, apply, state, workspaces and PR plan comments | `terraform` CLI |
| [Vercel](./vercel.md) | 11 | Projects, deployments and HTTP health checks | `VERCEL_TOKEN` |
| [Supabase](./supabase.md) | 6 | Projects, organizations and SQL | `SUPABASE_ACCESS_TOKEN` |
| [Database](./database.md) | 8 | Postgres and MySQL queries and schema inspection | A connection string per call |

## Payments

| Pack | Tools | What it does | Needs |
|---|---|---|---|
| [Stripe](./stripe.md) | 9 | Customers, draft and sent invoices, payment links, payments, refunds. Test keys first | `STRIPE_API_KEY` |

## Observability

| Pack | Tools | What it does | Needs |
|---|---|---|---|
| [Sentry](./sentry.md) | 8 | Projects, issues and triage | `SENTRY_AUTH_TOKEN` |

## Sales and growth

| Pack | Tools | What it does | Needs |
|---|---|---|---|
| [Research](./research.md) | 2 | Search the web and read pages as clean text | Nothing. `TAVILY_API_KEY` is optional |
| [Leads](./leads.md) | 3 | Find companies hiring and public company contacts | Nothing |
| [Pipeline](./pipeline.md) | 9 | A local sales pipeline: leads, deals, contacts, report, CSV export | Nothing |
| [SEO](./seo.md) | 4 | Keyword ideas, page audit, draft check, Search Console | Google sign-in for Search Console only |

## Productivity

| Pack | Tools | What it does | Needs |
|---|---|---|---|
| [Meetings](./meetings.md) | 9 | Transcribe recordings, save notes, track action items, prep for calls | `GROQ_API_KEY` for transcription only |
| [Reminders](./reminders.md) | 3 | Follow-ups saved locally and sent to Telegram | Nothing. Telegram is optional |
| [Calendar](./calendar.md) | 8 | Google Calendar events, free and busy, find meeting slots | Google sign-in |
| [Linear](./linear.md) | 7 | List, read, create and update issues | `LINEAR_API_KEY` |
| [Notion](./notion.md) | 15 | Pages, databases, blocks and comments | `NOTION_API_KEY` |

## Communication

| Pack | Tools | What it does | Needs |
|---|---|---|---|
| [Slack](./slack.md) | 8 | Channels, messages and threads | `SLACK_BOT_TOKEN` |
| [Discord](./discord.md) | 5 | Servers, channels, read and post messages as a bot | `DISCORD_BOT_TOKEN` |
| [Gmail](./gmail.md) | 8 | Search, read, send, reply and forward | Google sign-in |
| [Telegram](./telegram.md) | 5 | Alert yourself, read messages sent to your bot | `TELEGRAM_BOT_TOKEN` |

## Security and secrets

| Pack | Tools | What it does | Needs |
|---|---|---|---|
| [Secrets](./secrets.md) | 6 | An encrypted local secrets store | `SECRETS_MASTER_KEY` |

[BoundaryAttest](./boundaryattest.md) is an optional layer that signs receipts for three workflow
tools. It adds no tools of its own.

## Setting up a service

For any pack that needs a key, run:

```bash
causly-server setup <service>
```

It tells you where to get the key, checks it live, and saves it. See the
[CLI reference](../cli.md) and [Environment variables](../configuration.md).

## Finding the right tool

If you are not sure which tool does something, ask your agent to use `search_tools`. It searches
every pack, loaded or not:

```text
"Search your tools for something that lists failing CI runs."
```
