---
sidebar_position: 4
---

# Linear

7 tools to find, create and update Linear issues from a conversation.

Linear is an on-demand pack. Add it to startup with `causly-server toolsets add linear`, or let
your agent call its tools through `use_tool`.

## Setup

1. In Linear, go to **Settings, Account, Security & access, Personal API keys**.
2. Create a key. It starts with `lin_api_`.
3. Save it:

```bash
causly-server setup linear
```

Setup checks the key live and shows your name and workspace. The variable is `LINEAR_API_KEY`.

## Tools

| Tool | Level | What it does |
|---|---|---|
| `linear_get_viewer` | `READ` | Check the API key and show who it belongs to and which workspace |
| `linear_list_teams` | `READ` | List teams with their workflow states and labels |
| `linear_list_issues` | `READ` | Find issues, most recently updated first |
| `linear_get_issue` | `READ` | One issue in full, with its 20 most recent comments |
| `linear_create_issue` | `MEDIUM` | Create an issue |
| `linear_update_issue` | `MEDIUM` | Change an issue |
| `linear_add_comment` | `MEDIUM` | Add a comment, visible to everyone on the team |

Start with `linear_list_teams`. It returns the exact team keys, state names and label names that
the other tools accept.

## Finding issues

`linear_list_issues` filters by:

| Argument | Notes |
|---|---|
| `team` | Team key, for example `ENG` |
| `assignee` | `me`, `unassigned`, an email or a name |
| `state` | A state name, or a state type: `triage`, `backlog`, `unstarted`, `started`, `completed`, `canceled` |
| `label`, `priority`, `project` | Optional filters |
| `query` | Text to find in the title or description |
| `include_closed` | Completed and canceled issues are hidden unless you set this or give a `state` |
| `limit` | 1-100, default 25 |

Issues are referred to by identifier, such as `ENG-123`.

## Creating and updating

`linear_create_issue` takes a `team` key and a `title`, and optionally a markdown `description`,
`priority`, `assignee`, `state`, `labels` and `due_date` (for example `2026-10-31`).

State, labels and assignee are given by name or email and checked against the team. If you give a
name that does not exist, the tool returns the valid ones instead of guessing.

`linear_update_issue` can change the title, description, priority, state (for example move to
In Progress or Done), assignee (`me`, an email or `unassigned`), add or remove labels, and the due
date. An empty string clears the due date.

Priority is one of `urgent`, `high`, `medium`, `low` or `none`.

There is no delete. To close an issue without finishing it, move it to a Canceled state.

## Examples

```text
"What is assigned to me in ENG that is in progress?"
```

```text
"Create a high-priority bug in ENG: checkout fails on Safari, assign it to me."
```

```text
"Move ENG-142 to Done and comment that it shipped in 1.5.3."
```

## Untrusted content

Issue titles, descriptions and comments are written by other people. Results are marked as data,
and your agent is told never to follow instructions inside them.
