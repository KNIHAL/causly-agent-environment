---
sidebar_position: 1
sidebar_label: How it works
---

# How it works

Causly Server is a single Node.js process. Your MCP client (Claude Desktop, Cursor, Windsurf or
your own agent) starts it and talks to it over standard input and output. There is no network
listener and no Causly cloud.

```text
Your agent / editor
        |  MCP over stdio
        v
+--------------------------------------------------+
| Causly Server                                    |
|                                                  |
|  Tool router      search_tools, load_toolset,    |
|                   use_tool                       |
|  Safety layer     workspace limit, approval      |
|                   gate, redaction, activity log  |
|  Tool packs       files, git, github, pipeline,  |
|                   calendar, ... (loaded on use)  |
|  Local store      SQLite, secrets, ~/.causly/.env|
+--------------------------------------------------+
        |  HTTPS, with your own keys
        v
GitHub, Vercel, Slack, Google, Telegram, ...
```

## What happens when the server starts

1. Settings are loaded from your environment and `~/.causly/.env` (see
   [Environment variables](./configuration.md)).
2. The router tools, MCP resources and MCP prompts are registered.
3. The core packs load, plus any packs named in `CAUSLY_TOOLSETS`.
4. The server connects over stdio and waits for requests.

Startup messages go to stderr. Standard output carries only protocol messages, which is why Causly
uses its own small settings loader instead of a library that prints a banner.

## What happens on every tool call

Every tool, in every pack, is wrapped by the same pipeline:

1. **Reload settings** if `~/.causly/.env` changed, so new keys work without a restart.
2. **Workspace check.** If a workspace limit is on, every path in the arguments must be inside it.
3. **Approval check.** `HIGH` and `DESTRUCTIVE` tools must be called with `confirm: true`.
4. **Run the tool.**
5. **Log it.** One redacted line is appended to the activity log, with success, error or blocked
   status and the duration.
6. **Return the result.** Errors that point at a missing key include the exact command to fix it,
   for example `Fix: run "causly-server setup github" in a terminal.`

A call that fails step 2 or 3 never reaches the tool. It returns a `Blocked:` message that says
why. See [Security](./security.md) for the details of each check.

## Tool annotations

Every tool also tells the client how risky it is, using the four MCP annotations: `readOnlyHint`,
`destructiveHint`, `idempotentHint` and `openWorldHint`. They are worked out in one place
(`tools/annotations.js`) from the tool's permission level:

- `READ` tools are read-only and never marked destructive.
- `DESTRUCTIVE` tools, tools with destructive actions (`git_stash` drop, `git_tag` delete) and
  tools that overwrite existing state are marked destructive.
- Tools that talk to a service outside your machine (GitHub, Slack, a database, `http_check`,
  `git_push` and so on) are marked open-world.
- `use_tool` is never marked read-only, because it can call any tool.

Clients and directories use the hints to decide how to show and approve a tool. They are hints,
not enforcement: see [Security](./security.md#tool-annotations).

## Tool packs and lazy loading

Tools are grouped into packs, one per integration or feature, for example `github`, `docker`,
`pipeline` or `calendar`. A pack's code is imported only when the pack is loaded, so unused
integrations cost nothing at startup and add nothing to your agent's context.

| Kind | Packs | When they load |
|---|---|---|
| **Core** | `files`, `directory`, `command`, `project` | Always, at startup |
| **Startup** | Whatever `CAUSLY_TOOLSETS` lists. `init` sets `research`, `leads`, `seo`, `pipeline`, `reminders`, `meetings` | At startup |
| **On demand** | Every other pack | When your agent loads them |

`CAUSLY_TOOLSETS` accepts pack names separated by commas, or `all` to load everything. Manage it
with [`causly-server toolsets`](./cli.md#toolsets). An unknown pack name is ignored and reported
on stderr.

## Finding and calling tools

Three always-available router tools let an agent work with packs that are not loaded yet.

| Tool | What it does |
|---|---|
| `search_tools` | Find tools by keyword across **all** packs, loaded or not. With no query it lists every pack. It searches a prebuilt manifest, so nothing has to be loaded to search |
| `load_toolset` | Load one or more packs so their tools join the tool list |
| `use_tool` | Call any tool by name. If its pack is not loaded, it loads automatically |

### Why `use_tool` exists

Some clients, Claude Desktop among them, read the tool list once and do not refresh it during a
chat. A pack loaded mid-conversation would be invisible. `use_tool` solves this: the agent calls
`use_tool` with a tool name and arguments, and the call works immediately with no restart.

```json
{
  "tool": "github_list_issues",
  "arguments": { "owner": "acme", "repo": "web" }
}
```

Pass `"describe": true` to see a tool's parameters without running it. Arguments are validated
against the tool's schema, and a wrong call returns the parameter list instead of failing
silently.

`use_tool` is not a way around the safety layer. The tool it calls goes through the same
workspace check, approval gate and logging as a direct call.

## MCP resources

The server exposes read-only project context that a client can attach to a conversation:

| URI | Content |
|---|---|
| `causly://project/{path}/health` | Git cleanliness, dependency install status, env file presence |
| `causly://project/{path}/info` | Language, framework, package manager, resolved commands, branch and remotes |
| `causly://project/{path}/git` | Changed files, ahead and behind counts, clean state |

`{path}` is the project folder, URL-encoded as a single segment, for example
`causly://project/D%3A%5Cmy-app/health`.

## MCP prompts

Prompts are reusable instructions that guide an agent through a multi-step job using Causly's
tools. Your client shows them as commands or templates.

| Prompt | Purpose |
|---|---|
| `ship-feature` | Take a code change from request to an open pull request |
| `fix-ci` | Diagnose and fix a failing GitHub Actions run |
| `deploy-project` | Deploy and verify a project |
| `review-changes` | Review a pull request's diff, discussion and CI status |
| `cofounder` | Work as your technical co-founder |
| `follow-up-review` | Go through due reminders, suggest next actions, and close or snooze them |
| `process-meeting` | Turn a recording or notes into a saved meeting with action items |
| `meeting-prep` | Prepare for an upcoming meeting |
| `pipeline-review` | Review your sales pipeline |
| `prospecting` | Find prospects |

## Workflow tools

The `workflow` pack chains several primitives into one verified outcome, for example
`ship_change` runs checks, commits, pushes and opens a pull request, and stops with the exact
failure if a step fails. See [Workflow tools](./tools/workflow-tools.md).

## Local data

Everything Causly stores lives in `~/.causly` (see [Environment variables](./configuration.md)):

| Item | Used by |
|---|---|
| `.env` | Your keys and settings |
| `causly.db` | SQLite database for the pipeline, meetings and reminders. Each pack owns its tables and changes them through append-only migrations, so upgrades never rewrite existing data |
| Secrets store | The [secrets tools](./tools/secrets.md), encrypted |
| `logs/activity.log` | The audit log of every tool call |

Back up the database with [`causly-server backup`](./cli.md#backup-and-restore). Reminders are
sent to Telegram when it is configured, and are safe to run from several processes at once.
