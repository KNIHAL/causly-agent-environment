---
sidebar_position: 1
---

# Files, git, shell and project

The primitive layer everything else builds on: 42 tools across five packs. They work directly on
your local files and git repositories, so **no API keys are needed**.

| Pack | Tools | Loads |
|---|---|---|
| `files` | 9 | Always (core) |
| `directory` | 5 | Always (core) |
| `command` | 1 | Always (core) |
| `project` | 7 | Always (core) |
| `git` | 20 | On demand. Add it with `causly-server toolsets add git` |

Every tool call goes through the [safety layer](../security.md): the optional workspace limit, the
approval gate for `HIGH` and `DESTRUCTIVE` tools, and the activity log.

## Files

| Tool | Level | What it does |
|---|---|---|
| `read_file` | `READ` | Read the text of one file, up to 2 MB. A longer file is cut and marked `truncated` |
| `read_multiple_files` | `READ` | Read several files in one call, up to 2 MB each and 8 MB in total. A failure on one file does not stop the others. Files past the budget are skipped and marked |
| `create_file` | `MEDIUM` | Create a new file |
| `write_file` | `MEDIUM` | Create a file or completely overwrite it, creating parent folders as needed |
| `edit_file` | `MEDIUM` | Replace an exact piece of text without rewriting the whole file |
| `delete_file` | `DESTRUCTIVE` | Delete one file. Needs `confirm: true` |
| `move_file` | `MEDIUM` | Move or rename a file or folder |
| `copy_file` | `LOW` | Copy one file |
| `get_file_info` | `READ` | Size, type, and created and modified times |

`edit_file` needs the old text to match exactly, and to be unique unless `replace_all` is set. It
is the cheapest way to change a large file. In a file with Windows (CRLF) line endings, text that
spans several lines matches whichever line ending you type, and the file keeps its own line
endings after the edit.

## Directories

| Tool | Level | What it does |
|---|---|---|
| `list_directory` | `READ` | List the files and folders directly inside a folder. Shows the first 2000 entries and marks a larger folder `truncated` |
| `directory_tree` | `READ` | A recursive tree view. Does not walk dependency and build folders (`node_modules`, `.git`, `build`, `dist`, `.next`, `.docusaurus`, `.venv`, `venv`, `__pycache__`, `.turbo`, `coverage`); their names appear under `skipped`, and `include_ignored: true` walks them. `max_depth` defaults to 3 and is capped at 20. Stops after 1000 entries |
| `create_directory` | `LOW` | Create a folder, including missing parents |
| `delete_directory` | `DESTRUCTIVE` | Delete a folder, recursively by default. Needs `confirm: true` |
| `search_files` | `READ` | Find files and folders whose name contains a pattern, case-insensitive. Stops at `max_results` (up to 1000) or after 100,000 entries looked at |

File and folder tools check every path, including both ends of `copy_file` and `move_file`: they refuse to change system folders on Windows, macOS and Linux, and refuse to read or write credential folders such as `~/.ssh`. See
[Protected paths](../security.md#protected-paths).

## Git

20 tools for the full local git lifecycle. Load them with `causly-server toolsets add git`.

| Tool | Level | What it does |
|---|---|---|
| `git_init` | `LOW` | Initialize a repository |
| `git_status` | `READ` | Working tree status |
| `git_add` | `LOW` | Stage files |
| `git_commit` | `MEDIUM` | Commit staged changes |
| `git_push` | `HIGH` | Push commits to a remote. Visible to others and hard to undo, so it needs `confirm: true` |
| `git_pull` | `MEDIUM` | Pull from a remote |
| `git_log` | `READ` | Recent commit history |
| `git_diff` | `READ` | Uncommitted changes, optionally for one file |
| `git_diff_stat` | `READ` | A summary of files, insertions and deletions instead of the full diff |
| `git_branch` | `READ` | List local branches and show the current one |
| `git_create_branch` | `LOW` | Create a branch, optionally checking it out |
| `git_checkout` | `MEDIUM` | Check out an existing branch |
| `git_merge` | `HIGH` | Merge a branch into the current one. Changes the working branch, so it needs `confirm: true` |
| `git_reset` | `HIGH` | Reset the current branch to a ref. Needs `confirm: true` |
| `git_stash` | `MEDIUM` | Stash working changes. Only `action: "drop"` needs `confirm: true` |
| `git_show` | `READ` | Details of a commit or object |
| `git_remote` | `MEDIUM` | Manage and inspect remotes |
| `git_tag` | `MEDIUM` | Manage tags. Only `action: "delete"` needs `confirm: true` |
| `git_changed_files` | `READ` | Changed files with their change type |
| `git_check_clean` | `READ` | Whether the working tree is clean |

Commits stay local until you push. For a safe end-to-end flow that runs checks first, see
[`ship_change`](./workflow-tools.md).

## Project intelligence

7 tools that understand what kind of project a folder is and run its own commands, so your agent
does not have to guess whether to run `npm test`, `pytest` or `cargo test`.

| Tool | Level | What it does |
|---|---|---|
| `project_detect` | `READ` | Detect the language, framework and package manager from manifest files |
| `project_info` | `READ` | Language, framework, package manager, the resolved test, lint, typecheck and build commands, and the git branch and remotes |
| `project_health` | `READ` | Git cleanliness and ahead or behind counts, whether dependencies are installed, and which env files exist |
| `run_tests` | `LOW` | Detect and run the project's test command. Returns stdout, stderr and the exit code |
| `run_lint` | `LOW` | Detect and run the lint command |
| `run_typecheck` | `LOW` | Detect and run the typecheck command |
| `run_build` | `LOW` | Detect and run the build command |

`run_tests`, `run_lint`, `run_typecheck` and `run_build` run the project's own scripts (for example
`npm test` from `package.json`). A project you did not write can run anything in those scripts, so
treat an unfamiliar repository like untrusted code. They are `LOW` by default. Set
`CAUSLY_STRICT_PROJECT_COMMANDS=true` to make them `HIGH`: each call then needs your approval, or
`confirm: true` on clients without prompts. See [Security](../security.md#project-commands).

The same information is available as [MCP resources](../architecture.md#mcp-resources), which a
client can attach to a conversation.

## Shell

`run_command` runs a shell command in a folder you give it. It is a `HIGH` tool, so it needs
`confirm: true`.

| Argument | Notes |
|---|---|
| `command` | The command to run |
| `cwd` | The working folder. Must be inside your [workspace](../security.md#workspace-limit) if a limit is on |
| `timeout_ms` | Default 60,000 (one minute) |
| `confirm` | Must be `true` |

The result holds only `stdout`, `stderr` and `exit_code` (plus `timed_out` after a timeout, and a `risk` note when the command was flagged). It does not repeat the command or folder you sent. Output is capped at 20,000 characters. On Windows, commands run through PowerShell, not
`cmd.exe`, so PowerShell syntax works. Catastrophic commands are blocked and risky ones are
flagged. See [Command safety](../security.md#command-safety).

Commands inherit the server's environment, including your keys. See
[What is not protected](../security.md#what-is-not-protected).

## Examples

```text
"Show me what changed since the last commit, then commit it as 'fix: handle empty response'."
```
Claude calls `git_diff`, `git_add` and `git_commit`.

```text
"Run the tests and tell me what fails."
```
Claude calls `project_info` to learn the stack, then `run_tests`.
