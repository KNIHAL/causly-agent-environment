---
sidebar_position: 2
sidebar_label: Security
---

# Security

Causly Server can read your files, run commands, push code and send messages. The controls below
live inside the server, so they apply no matter which agent or editor is calling it.

Read the [limits](#what-is-not-protected) section too. These are guardrails against mistakes. They
are not a sandbox.

## Overview

| Control | What it does |
|---|---|
| [Permission levels](#permission-levels) | Every tool has a risk level. High-risk and destructive tools need `confirm: true` |
| [Workspace limit](#workspace-limit) | Restrict file and command tools to the folders you choose |
| [Command safety](#command-safety) | Catastrophic shell commands are blocked. Risky ones are flagged |
| [Protected paths](#protected-paths) | System folders cannot be changed, credential folders cannot be read or written |
| [Network guard](#network-guard) | URL-fetching tools only reach public addresses |
| [Secret redaction](#secret-redaction) | Tokens and passwords are removed before anything is logged |
| [Encrypted secrets](#encrypted-secrets) | A local store, AES-256-GCM, with a key only you hold |
| [Activity log](#activity-log) | A structured record of every tool call |

## Permission levels

Every tool has one of five levels.

| Level | Meaning | Examples |
|---|---|---|
| `READ` | No side effects | `read_file`, `git_status`, `github_list_issues`, `calendar_list_events` |
| `LOW` | Normal work, small and easy to undo | `git_add`, `create_directory`, `pipeline_add_lead`, `reminder_create` |
| `MEDIUM` | Changes files or project state | `write_file`, `edit_file`, `git_commit`, `git_push`, `calendar_create_event` |
| `HIGH` | Hard to undo or visible to others | `run_command`, `github_merge_pull_request`, `vercel_create_deployment`, `slack_send_message`, `gmail_send`, `terraform_apply`, `ship_change`, `deploy_project` |
| `DESTRUCTIVE` | Deletes or cannot be reversed | `delete_file`, `delete_directory`, `terraform_destroy`, `docker_remove`, `calendar_delete_event`, `meeting_delete` |

A tool that is not in the table defaults to `MEDIUM`.

### The approval gate

`READ`, `LOW` and `MEDIUM` tools run immediately. `HIGH` and `DESTRUCTIVE` tools are refused unless
the call includes `confirm: true`:

```text
Blocked: 'github_merge_pull_request' is a HIGH-risk action and requires explicit
confirmation. Re-call with confirm: true to proceed.
```

The gate forces the agent to make a conscious second call, and a well-behaved agent asks you
before making it. It is not a separate approval screen: an agent that decides to pass
`confirm: true` can do so. Treat it as a seatbelt. If you want a hard boundary, use the
[workspace limit](#workspace-limit) and keep your keys scoped to what you are comfortable with.

Some tools add their own confirmation on top of their level. For example, calendar tools require
`confirm` when they would email guests, and `meeting_transcribe` requires it because it uploads
audio to Groq.

## Workspace limit

By default, file tools can reach any folder your user can. Turn on the workspace limit to confine
them:

```bash
causly-server init --workspace D:\my-project
```

You can allow several folders. Separate them with `;` on Windows or `:` on macOS and Linux. This
sets `CAUSLY_WORKSPACE`. See [Environment variables](./configuration.md).

With a limit on, Causly checks these arguments of every tool call: `path`, `paths`, `root_path`,
`cwd`, `repo_path`, `dir`, `project_dir`, `context_dir`, `dockerfile`, `source`, `destination`,
`store_path`, `plan_file`, `var_file` and `transcript_file`. Any value outside the allowed folders
is blocked:

```text
Blocked: 'read_file' path "C:\Users\you\.ssh\id_rsa" is outside the allowed workspace
(CAUSLY_WORKSPACE).
```

Details:

- Symbolic links are resolved first, so a link inside the workspace cannot point outside it.
- New files are checked too: the nearest existing parent folder must be inside the workspace.
- Path comparison is case-insensitive on Windows.
- `causly-server doctor` and `status` show whether a limit is on.

## Command safety

`run_command` is a `HIGH` tool. Before it runs a command:

- **Blocked outright:** `rm -rf /`, deleting or formatting a whole drive (`format C:`,
  `del /s /q C:\`), a fork bomb, `shutdown` or `restart-computer`, and `reg delete`. If a harmless
  command trips the filter, rephrase it.
- **Flagged and logged:** commands that match risky signals still run, but the audit log records
  why they were risky. The signals are deleting files, `DROP` and `TRUNCATE` statements,
  force-pushes, hard resets, piping a download into a shell, `chmod -R 777`, privilege elevation
  (`sudo`, `runas`), writing to a disk device, `npm publish`, and `gh repo delete`.

Commands run with a 60 second default timeout and output is capped at 20,000 characters. On
Windows they run in PowerShell.

## Protected paths

File and directory tools check every path before they touch it. Two kinds of location are protected.

**System folders: writing and deleting are refused, reading is allowed.**

| System | Protected folders |
|---|---|
| Windows | `C:\Windows`, `C:\Program Files`, `C:\Program Files (x86)`, `C:\ProgramData`, `C:\Users\Default`, `C:\Users\Public`, `C:\System Volume Information`, `C:\Recovery`, `C:\Boot`, plus the folders named by `SystemRoot` and `ProgramFiles` when Windows is installed elsewhere |
| macOS | `/System`, `/Library`, `/usr`, `/bin`, `/sbin`, `/etc` (also `/private/etc`), `/private/var/db`, `/dev` |
| Linux | `/etc`, `/usr`, `/bin`, `/sbin`, `/lib`, `/lib32`, `/lib64`, `/boot`, `/dev`, `/proc`, `/sys` |

**Credential folders: reading and writing are both refused**, so an agent cannot read or replace
your keys. These are `~/.ssh`, `~/.aws`, `~/.config/gcloud`, `~/.kube`, `~/.gnupg`, `~/.azure`, Causly's own folder (`~/.causly` or `CAUSLY_HOME`, which holds your API keys and the secrets store, plus the file named by `CAUSLY_ENV_FILE` and the `.env` of a git checkout) and the OS keychain folders:
`~/Library/Keychains` and `/Library/Keychains` on macOS, `~/.local/share/keyrings` on Linux, and on
Windows the `Credentials`, `Protect` and `Vault` folders under `AppData\Roaming\Microsoft` and
`AppData\Local\Microsoft`, plus `AppData\Roaming\gcloud` and `AppData\Roaming\gnupg`. This covers every user's home folder, not
only yours. The `causly-server keys` and `setup` commands still manage Causly's own files; only the
agent's file tools are blocked from them.

How a path is checked:

- **Real path first.** `..`, symlinks, junctions and Windows 8.3 short names (`PROGRA~1`) are
  resolved before the check, so a link into a protected folder is refused. This also applies to a
  new file created inside a linked folder.
- **Folder boundaries.** `C:\Windows.old` and `/etcetera` are not treated as inside `C:\Windows`
  and `/etc`.
- **Windows tricks.** Trailing dots and spaces, `\\?\` prefixes, the admin share of this machine
  (`\\localhost\C$\Windows`), reserved device names (`CON`, `NUL`, `COM1`) and NTFS alternate data
  streams (`file.txt::$DATA`) are refused.
- **Search and tree listings** skip credential folders instead of listing them.
- **Every file and directory tool** goes through the same check, including both ends of
  `copy_file` and `move_file`, and the `store_path` of the secrets tools.

The workspace limit above still applies on top and is the way to keep file tools inside your
project folders. Shell commands run through `run_command` are not covered by this check; see
[What is not protected](#what-is-not-protected).
## Network guard

`web_fetch`, `http_check` and the lead and SEO tools fetch URLs for the agent, so hostile page
content could try to point them at your own network. They all go through one guard: only public
addresses are allowed. Loopback (`127.0.0.1`, `localhost`), private ranges (`10.x`, `172.16.x` to
`172.31.x`, `192.168.x`), link-local addresses (`169.254.x`, which includes cloud metadata
services) and other reserved addresses are refused.

The check runs when the connection is made, so a name that resolves to a private address is
refused too, and it runs again on every redirect. Unusual spellings of an address (decimal, octal,
hex, IPv4-mapped IPv6) are normalized before the check, and IPv6 forms that carry an IPv4 address (6to4, ISATAP, Teredo) are judged by that address. Set `CAUSLY_ALLOW_PRIVATE_HOSTS=true` to
switch the guard off, for example to read a local dev server.

## Secret redaction

Before anything is written to the activity log, Causly walks the tool input and replaces the
value of any field whose name contains `token`, `password`, `passwd`, `secret`, `api_key`,
`apikey`, `authorization`, `refresh_token`, `access_token`, `credential`, `private_key`,
`client_secret`, `auth_token`, `db_pass`, `connection_string`, `dsn` or `database_url` with `[REDACTED]`. Free-text error messages are scrubbed
for patterns such as `token=abc123` or `"password": "..."`, passwords inside URLs (`postgres://user:password@host`), `Bearer` tokens and common token formats (GitHub, Slack, AWS and similar). Error messages returned to the agent are scrubbed the same way. Live key checks (`doctor --test`) also scrub the key from
their error messages.

Redaction works on field names, `key=value` text, URL credentials and well-known token formats. A secret of any other shape pasted into an unrelated
free-text field is not detected.

## Encrypted secrets

The [secrets tools](./tools/secrets.md) keep values in a local encrypted store. Each value is
encrypted with AES-256-GCM, using a fresh random initialization vector, under a master key that
you generate and keep in `SECRETS_MASTER_KEY`. Nothing is sent to an external vault. Without the
master key, the store cannot be read, and it cannot be recovered if you lose it.

`secrets_set` and `secrets_rotate_key` are `HIGH`, `secrets_get` is `MEDIUM`, and `secrets_delete`
is `DESTRUCTIVE`.

## Activity log

Every tool call, including blocked ones, appends one JSON line to `~/.causly/logs/activity.log`:

```json
{
  "timestamp": "2026-10-29T09:14:03.221Z",
  "operation_id": "5f0c...",
  "tool": "github_merge_pull_request",
  "risk_level": "HIGH",
  "status": "BLOCKED",
  "input": { "owner": "acme", "repo": "web", "pull_number": 42 },
  "details": "'github_merge_pull_request' is a HIGH-risk action and requires explicit confirmation...",
  "duration_ms": null
}
```

`status` is `SUCCESS`, `ERROR` or `BLOCKED`. Inputs are redacted before they are written. Logging
never interrupts a tool call: if writing the log fails, the call still completes.

## Privacy

Causly Server has no Causly cloud and no Causly account. Your keys are in `~/.causly/.env` and
your pipeline, meetings and reminders are in a local SQLite file.

Data leaves your machine only to a service you configured, and only when a tool for that service
runs: for example GitHub, Gmail, Telegram, or Groq for transcription. Two cases are worth knowing:

- Audio is uploaded to Groq only when you confirm a `meeting_transcribe` call.
- `status` and `doctor` ask the npm registry for the latest version, at most once a day. Turn it
  off with `CAUSLY_UPDATE_CHECK=off`.

## What is not protected

Be clear about the limits of these controls.

- **The workspace limit is a guardrail, not a sandbox.** It checks path arguments. It does not
  inspect the text of a shell command or Docker volume mounts, so a command can still reach files
  the limit would block for `read_file`.
- **Commands inherit the server's environment.** A command run with `run_command` can see the same
  environment variables as the server, which includes the keys loaded from your settings file.
  Only run Causly Server with an agent you trust, and use scoped, revocable keys.
- **The approval gate is a flag, not a screen.** See [above](#the-approval-gate).
- **Anything the agent reads can influence it.** Web pages, emails, issues and calendar entries
  are untrusted text. Prompt injection through them is a risk for any agent with tools. Prefer
  read-only keys where you can, and keep `confirm` decisions with you.
- **Keys are as powerful as you make them.** Causly can only do what your tokens allow. Create
  fine-grained tokens with the smallest scopes you need.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Follow the instructions in
[SECURITY.md](https://github.com/KNIHAL/causly-server/blob/master/SECURITY.md).

## BoundaryAttest

For `ship_change`, `verify_ci_fix` and `deploy_project`, Causly can optionally produce a signed
receipt of what happened. It is off by default. See [BoundaryAttest](./tools/boundaryattest.md).
