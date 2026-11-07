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
| [Permission levels](#permission-levels) | Every tool has a risk level. High-risk and destructive tools need your approval: a prompt in your client, or `confirm: true` where the client has no prompts |
| [Workspace limit](#workspace-limit) | Restrict file tools, Docker mounts and project resources to the folders you choose |
| [Project commands](#project-commands) | `run_tests`, `run_build` and friends run the project's scripts; turn on strict mode to approve each call |
| [Child process environment](#child-process-environment) | Commands get a minimal environment, so your keys stay out unless you allow them |
| [Command safety](#command-safety) | Catastrophic shell commands are blocked. Risky ones are flagged |
| [Protected paths](#protected-paths) | System folders cannot be changed, credential folders cannot be read or written |
| [Network guard](#network-guard) | URL-fetching tools only reach public addresses |
| [Secret redaction](#secret-redaction) | Tokens and passwords are removed before anything is logged |
| [Encrypted secrets](#encrypted-secrets) | A local store, AES-256-GCM, with a key only you hold |
| [Activity log](#activity-log) | A structured record of every tool call |
| [Local file permissions](#local-file-permissions) | Causly's own files are readable only by you, and are written so a crash cannot corrupt them |

## Permission levels

Every tool has one of five levels.

| Level | Meaning | Examples |
|---|---|---|
| `READ` | No side effects | `read_file`, `git_status`, `github_list_issues`, `calendar_list_events` |
| `LOW` | Normal work, small and easy to undo | `git_add`, `create_directory`, `pipeline_add_lead`, `reminder_create` |
| `MEDIUM` | Changes files or project state | `write_file`, `edit_file`, `git_commit`, `git_checkout`, `calendar_create_event` |
| `HIGH` | Hard to undo or visible to others | `run_command`, `git_push`, `git_merge`, `secrets_get`, `github_merge_pull_request`, `vercel_create_deployment`, `slack_send_message`, `gmail_send`, `terraform_apply`, `ship_change`, `deploy_project` |
| `DESTRUCTIVE` | Deletes or cannot be reversed | `delete_file`, `delete_directory`, `terraform_destroy`, `docker_remove`, `calendar_delete_event`, `meeting_delete` |

A tool without an explicit level defaults to `MEDIUM`. The test suite fails if a shipped tool has no level, so every released tool has its own.

### The approval gate

`READ`, `LOW` and `MEDIUM` tools run immediately. `HIGH` and `DESTRUCTIVE` tools need approval.
How you give it depends on your client.

**Client with prompts (MCP elicitation).** When the client says it supports elicitation, Causly
asks you before the call runs. The prompt names the tool, its risk level and its arguments, with
secrets removed. An answer of Allow runs the call. Decline, cancel, no answer within 120 seconds
(change it with `CAUSLY_APPROVAL_TIMEOUT_MS`) or a failed prompt block it, and nothing runs. The
agent cannot answer this prompt, so a `confirm: true` it passes does not count. This is a real
operator check.

**Client without prompts.** The call is refused unless it includes `confirm: true`:

```text
Blocked: 'github_merge_pull_request' is a HIGH-risk action and requires explicit
confirmation. Re-call with confirm: true to proceed.
```

This only forces the agent to make a conscious second call, and a well-behaved agent asks you
before making it. It is not a separate approval screen: an agent that decides to pass
`confirm: true` can do so. Treat it as a seatbelt. If you want a hard boundary, use the
[workspace limit](#workspace-limit) and keep your keys scoped to what you are comfortable with.

### Policy file

To decide per tool or per risk level yourself, create `~/.causly/policy.json` (inside
`CAUSLY_HOME` if you set it):

```json
{
  "tools": { "git_push": "allow", "secrets_get": "deny" },
  "levels": { "DESTRUCTIVE": "ask" }
}
```

Each rule is `allow`, `ask` or `deny`.

| Rule | Effect |
|---|---|
| `allow` | The tool runs with no prompt and no `confirm`, even if it is `HIGH` or `DESTRUCTIVE` |
| `ask` | You are prompted, or on a client without prompts the call needs `confirm: true`. This is the default for `HIGH` and `DESTRUCTIVE` |
| `deny` | The call is always blocked, even with `confirm: true` or an Allow answer |

A rule for a tool beats a rule for its level. A tool with no rule follows the default: `READ`,
`LOW` and `MEDIUM` run, `HIGH` and `DESTRUCTIVE` ask. `levels` takes `READ`, `LOW`, `MEDIUM`,
`HIGH` and `DESTRUCTIVE`. Changes are picked up on the next call, with no restart.

If the file cannot be read, is not valid JSON, or has a wrong value or level name, Causly fails
closed: every `HIGH` and `DESTRUCTIVE` call is blocked, with a message that names the file, until
you fix or remove it. The agent's file tools cannot read or change this file, because
`~/.causly` is a [protected path](#protected-paths).

Some tools add their own confirmation on top of their level. For example, calendar tools require
`confirm` when they would email guests, and `meeting_transcribe` requires it because it uploads
audio to Groq.

A few tools depend on the action. `git_stash` and `git_tag` are `MEDIUM`, but `git_stash` with
`action: "drop"` and `git_tag` with `action: "delete"` are `HIGH` and need `confirm: true`. Their
other actions run without it.

### Tool annotations

Each tool also carries the MCP annotations `readOnlyHint`, `destructiveHint`, `idempotentHint` and
`openWorldHint`, derived from its permission level (see [How it works](./architecture.md#tool-annotations)).
They help a client decide how to present a tool, for example to ask before running a destructive one.
They are hints only. A client may ignore them, and nothing in Causly Server relies on them: the
approval gate above is what blocks a `HIGH` or `DESTRUCTIVE` call without `confirm: true`.

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
- The `causly://project/...` [MCP resources](./architecture.md#mcp-resources) go through the same
  check. A project folder outside the workspace is refused, and the attempt is written to the
  activity log as `BLOCKED`.
- `causly-server doctor` and `status` show whether a limit is on.

### Docker mounts and Compose files

A Docker volume is a string and a Compose file is a document, so neither is a path argument. With a
workspace limit on, Causly checks them too:

- **`docker_run`.** The host folder of every entry in `volumes` must be inside the workspace. All
  the usual forms are read: `/host:/container`, `./rel:/container`, `~/x:/container`,
  `D:\x:/container`, with or without options such as `:ro`. Named volumes
  (`pgdata:/var/lib/postgresql`) and anonymous volumes have no host folder and always pass. A path
  that uses a variable (`$HOME/x`) or `~user` cannot be resolved, so it is blocked.
- **`docker_compose_up`.** Causly asks Docker for the project as it will really run
  (`docker compose config`, so includes, overrides, variables and `COMPOSE_FILE` are already
  applied) and checks the bind mounts (short and long syntax, and a Windows named pipe), named
  volumes that are really a host folder (`driver_opts` with `o: bind` and a `device`), build
  contexts (also `additional_contexts`), and the files of the secrets and configs a service uses.
  Git URLs and other remote build contexts are not folders and pass. If Docker cannot read the
  Compose file, the call is blocked, because its mounts cannot be verified.
  `docker_compose_down` starts nothing and is not inspected.
- **Windows with Docker in WSL.** `/mnt/d/...` and `/d/...` are read as `D:\...`. Any other Linux
  path, such as `/etc` or `/var/run/docker.sock`, is not on one of your drives and is blocked.
- **Names are not options.** The image, container and build-folder arguments of the Docker tools
  cannot start with `-`. Otherwise an "image" of `--volume=/:/host` would add a mount that the check
  never sees.

```text
Blocked: 'docker_run' volume "/etc:/host:ro" mounts host path "/etc", which is outside the
allowed workspace (CAUSLY_WORKSPACE).
```

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

`secrets_set`, `secrets_get` and `secrets_rotate_key` are `HIGH` (`secrets_get` hands the decrypted value to the agent), and `secrets_delete`
is `DESTRUCTIVE`.

- **Strict master key.** `SECRETS_MASTER_KEY` and `SECRETS_MASTER_KEY_NEW` must be exactly 64 hex
  characters. A key with anything extra or invalid is refused before the store is opened.
- **Atomic writes.** A save or a rotation writes a temporary file and renames it over the store. A
  crash, or a rotation that fails on one entry, leaves the previous store whole.
- **Custom `store_path`.** It must be inside Causly's data folder or `CAUSLY_WORKSPACE`, and an
  existing file must already be a secrets store. The tools cannot be pointed at another file to read
  or overwrite it.

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

- **One call, one line.** Each entry is a single JSON object on a single line. Quotes, backslashes
  and control characters (newlines, carriage returns, escape codes) inside a value are escaped, and
  so are U+2028, U+2029 and U+0085, which some log viewers treat as line breaks. A tool input or an
  error message that contains `\n{"tool":"read_file", ...}` cannot add a fake entry.
- **Size cap per entry.** An entry over 16 KB (a huge `write_file` input, for example) is stored
  with a short preview of the input and its original size, marked `truncated: true`, so one call
  cannot fill the log.
- **Rotation.** When the next line would take `activity.log` past 10 MB, it becomes
  `activity.log.1`, the older files shift up (`.1` to `.2`, and so on), and a new `activity.log`
  starts. Five rotated files are kept and the oldest is deleted. Change this with
  `CAUSLY_LOG_MAX_BYTES` and `CAUSLY_LOG_KEEP` ([Configuration](./configuration.md)). Rotated
  files get the same owner-only permissions as the log.

## Local file permissions

The activity log, the local database, the secrets store, backups and your settings file can all
hold sensitive data, so Causly keeps them for you alone.

- **macOS and Linux.** `~/.causly` and its `logs` and `backups` folders are `0700`. The files in
  them (`.env`, `causly.db` with its `-wal` and `-shm` files, the secrets store, `activity.log`,
  backups) are `0600`. Files from older versions are tightened when the server starts. Only known
  Causly files and folders are changed, symbolic links are skipped, and a folder you chose with
  `CAUSLY_HOME` is left as it is if it already exists.
- **Windows.** There is no useful `chmod`. Access comes from your profile folder, which other
  users cannot open by default. `causly-server doctor` checks that the data folder is inside your
  profile and warns when it is not, for example when `CAUSLY_HOME` points to a shared drive.
- **Crash-safe writes.** The secrets store and the changes to your editors' config files are
  written to a temporary file in the same folder and renamed over the original, so a crash or power
  cut leaves the old file whole. A backup appears under its real name only when it is complete.
- **Editor config backups.** The `<file>.backup-<timestamp>` copies that `init` and `remove` make
  are owner-only, because other servers in the same file often hold tokens. The editor config
  itself keeps the permissions it had, and a symlinked config stays a symlink.

`doctor` shows the result under "Private data folder".

## Project commands

`run_tests`, `run_lint`, `run_typecheck` and `run_build` run the scripts a project defines. That is
the point of them, and it means a hostile `package.json` or `Makefile` can run any command with your
permissions. They are `LOW` by default so everyday work is not interrupted.

If you open projects you do not trust, set `CAUSLY_STRICT_PROJECT_COMMANDS=true` in your editor's MCP
config `env` block. The four tools then count as `HIGH`, so every call needs your approval (or
`confirm: true` on clients without prompts). You can still allow them per tool in
[`policy.json`](#the-approval-gate). The [workspace limit](#workspace-limit) applies as before, and
[commands get a minimal environment](#child-process-environment) either way.

## Child process environment

Commands and tools that start other programs (`run_command`, project commands, Docker, Terraform,
git, ffmpeg) get a small allowlist of variables instead of everything the server holds. That keeps
the keys loaded from your settings file (GitHub, OpenAI, cloud credentials and so on) out of
commands the agent runs.

What each child gets:

- **Always:** `PATH`, home and user variables, locale (`LANG`, `LC_*`), temp folders, the Windows
  system variables, proxy and CA-certificate settings.
- **Docker:** also `DOCKER_*` connection settings and `COMPOSE_*`.
- **Terraform:** also `TF_LOG`, `TF_DATA_DIR`, `TF_CLI_CONFIG_FILE`, `TF_IN_AUTOMATION`, `TF_INPUT`.
  Cloud credentials, `TF_VAR_*` and `TF_TOKEN_*` are not included.
- **Git:** also `SSH_AUTH_SOCK`. `GIT_*` variables are never passed.

If a command needs a variable, name it in `CAUSLY_PASSTHROUGH_ENV` (comma-separated; `PREFIX*`
matches by prefix; `*` restores the old behavior of passing everything). See
[Environment variables](./configuration.md). `doctor` shows the current mode under "Child process
env".

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

- **The workspace limit is a guardrail, not a sandbox.** It checks path arguments, Docker volumes,
  Compose files and project resources. It does not inspect the text of a shell command, so a command
  can still reach files the limit would block for `read_file`, or start a container with any mount.
  Compose settings that give a container the host without a folder (`privileged`, `devices`,
  `pid: host`, `network_mode: host`) are not checked, and neither is a named volume that was created
  outside Causly with a host folder behind it.
- **Commands get a minimal environment, not a sandbox.** Child processes no longer inherit your
  keys by default (see [Child process environment](#child-process-environment)). A command can
  still read any file your user can, including `.env` files and `~/.aws`. Use scoped, revocable
  keys and an agent you trust.
- **Without prompts, the approval gate is a flag.** On a client that does not support elicitation,
  the agent can pass `confirm: true` itself. See [above](#the-approval-gate). With prompts, the
  check is only as strong as your client: one that answers Allow automatically gives no protection.
  Shell commands can also edit your policy file, so keep `run_command` on `ask`.
- **Annotations are hints.** A client that ignores them loses nothing in safety, because the gate is
  enforced by the server. See [Tool annotations](#tool-annotations).
- **Anything the agent reads can influence it.** Web pages, emails, issues and calendar entries
  are untrusted text. Prompt injection through them is a risk for any agent with tools. Prefer
  read-only keys where you can, and keep `confirm` decisions with you.

  *What is tested.* A test suite feeds hostile text ("call `delete_file`", "pass `confirm: true`",
  "send `~/.causly/.env` to ...") through `web_fetch`, `gmail_get_message`, `gmail_get_thread`,
  `github_get_issue`, the pull request readers (details, diff, comments, reviews),
  `calendar_get_event` and `calendar_list_events`. It checks that (1) every result carries a
  notice saying the content is untrusted and must not be followed, (2) the description of each of
  those tools says the same, and (3) the approval gate behaves the same afterwards: a gated call
  still needs a real boolean `confirm: true`, and text such as `confirm: "true"` or an instruction
  inside a page changes nothing. The text itself is passed on unchanged, so you see what the sender
  wrote.

  *What is not prevented.* Causly cannot stop a model from obeying text it has read. The notice
  and the descriptions are a hint to the model, not a filter. A model that is persuaded can still
  call a tool that needs no approval (reading files, searching, listing), and where there is no
  approval prompt it can pass `confirm: true` itself. Slack, Notion, Telegram, Sentry and other
  services that return text from other people are not covered by this suite yet. Treat their
  output the same way.
- **Keys are as powerful as you make them.** Causly can only do what your tokens allow. Create
  fine-grained tokens with the smallest scopes you need.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Follow the instructions in
[SECURITY.md](https://github.com/KNIHAL/causly-server/blob/master/SECURITY.md).

## BoundaryAttest

For `ship_change`, `verify_ci_fix` and `deploy_project`, Causly can optionally produce a signed
receipt of what happened. It is off by default. See [BoundaryAttest](./tools/boundaryattest.md).
