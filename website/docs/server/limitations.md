---
sidebar_position: 2
---

# Limitations

What Causly Server does not do today. These are structural limits, not bugs. For problems you can
fix, see [Troubleshooting](./troubleshooting.md).

## Scope

- **Local and single-user.** Causly Server is a process your MCP client starts over stdio. There
  is no remote or multi-user mode, no shared team workspace, and no hosted agent or chat
  interface.
- **Any MCP client, tested with a few.** Tested with Claude Desktop, Cursor, Windsurf, a plain
  JavaScript MCP client and LangChain (JS). Claude Code is supported through the command that
  `init` prints. Other clients should work but are not tested.
- **Request and response only.** Tools run when your agent calls them. Nothing watches your
  infrastructure in the background. The one exception is the reminder job, which runs only while
  a Causly Server process is running.
- **Your agent decides what to call.** Causly provides tools and guardrails. The quality of what
  gets done depends on the agent and model you connect.

## Platforms

- **Node.js 22.13 or newer** is required.
- **Windows** is tested by hand. **macOS and Linux** run the full automated test suite on every
  change (Ubuntu, macOS and Windows, on Node.js 22 and 24), but have had less hands-on use. Reports are welcome.
- Docker tools fall back to `wsl docker` on Windows when Docker only exists inside WSL.
- On Windows, commands run by `run_command` use the same Node.js as the server, so `npm install` with postinstall scripts works even when your editor starts the server with a stripped environment.

## Google

- While your Google app is in **Testing** status, Google expires the refresh token after 7 days.
  Run `causly-server login google` to renew it, or publish the app to production.
- Gmail, Calendar and Search Console need a Google OAuth client that you create yourself.

## Safety

- The **workspace limit is a guardrail, not a sandbox.** It checks path arguments. It does not
  inspect the text of shell commands or Docker mounts.
- The **approval gate** is a flag the agent must pass, not a separate approval screen.
- **Tool annotations are hints.** Each tool tells your client whether it is read-only, destructive, idempotent or reaches outside your machine. Clients decide how to use that. The server still enforces permission levels and the approval gate on its own.
- Commands run with `run_command` inherit the server's environment, including your keys.
- BoundaryAttest is a proof of concept. It covers three workflow tools and uses a key file you
  manage. It has no production key storage, rotation, revocation, KMS or HSM integration, or
  trust registry. See [BoundaryAttest](./tools/boundaryattest.md).

See [Security](./security.md#what-is-not-protected) for the full list.

## Tools

- **No direct cloud tools.** Azure, GCP and AWS SDK tools are out of scope. You can still provision
  cloud resources with the [Terraform tools](./tools/terraform.md).
- **Transcription needs the internet.** `meeting_transcribe` uses Groq Whisper. A local engine is
  not available yet.
- **Keyword ideas have no search volume.** They come from search autocomplete. Use Search Console
  for your own site's real numbers.
- **No outreach tools for LinkedIn, X or WhatsApp.** Email goes through [Gmail](./tools/gmail.md).
- **Pipeline does not send messages.** It records what happened. Sending is a separate step.
- **Recurring calendar events.** Updating one only changes the event id you pass, not the whole
  series.
- **No sync between machines.** Your pipeline, meetings and reminders are in one local database.
  Use [`backup`](./cli.md#backup-and-restore) to move or keep a copy.

## Service-specific limits

- Vercel deployment tools need a project that is already git-linked.
- `supabase_run_sql` goes through the Supabase Management API. Some tokens get a `403` for SQL.
- `slack_search_messages` needs a Slack user token with `search:read`.
- `docker_push` needs registry authentication configured on the host.
- Sentry `resolve_issue`, `ignore_issue` and `add_comment` need the `event:write` scope.

Fixes are in [Troubleshooting](./troubleshooting.md#service-specific-issues).
