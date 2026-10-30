---
sidebar_position: 3
---

# Pipeline

9 tools for a sales pipeline that lives on your machine. Track prospects as deals, move them
through stages, log what happened, and ask what to do next. Data is stored in the local SQLite
database (`~/.causly/causly.db`), so it survives restarts and new chats.

Pipeline loads at startup by default. It needs no API keys.

## Stages

A deal moves through these stages:

```text
lead -> contacted -> replied -> meeting -> proposal -> won
                                                   \-> lost
```

Moving a deal to `won` or `lost` closes it and cancels its pending follow-ups.

## Tools

| Tool | Level | What it does |
|---|---|---|
| `pipeline_add_lead` | `LOW` | Add a prospect: finds or creates the company and contact, and opens a deal at `lead` |
| `pipeline_list` | `READ` | List deals with stage, value, days since last activity and next follow-up |
| `pipeline_get` | `READ` | One deal in full: company, contacts, activity timeline and pending follow-ups |
| `pipeline_update` | `LOW` | Change stage, value, title, next step or notes. Stage changes are logged |
| `pipeline_log_activity` | `LOW` | Record an email, call, meeting, proposal or note on a deal |
| `pipeline_add_contact` | `LOW` | Add another person at a deal's company |
| `pipeline_report` | `READ` | The pipeline at a glance, to decide what to do next |
| `pipeline_export` | `MEDIUM` | Write deals or contacts to a CSV file |
| `pipeline_delete_deal` | `DESTRUCTIVE` | Permanently delete a deal. Needs `confirm: true` |

## Adding leads without duplicates

`pipeline_add_lead` matches the **company** by website domain or name, and the **contact** by
email. If the company already has an open deal, no second deal is created. New contact details and
notes are added to the existing one instead.

| Argument | Notes |
|---|---|
| `company` | Required |
| `website`, `contact_name`, `email`, `phone`, `title` | Optional. `email` is what prevents duplicate contacts |
| `source`, `source_url` | Where the lead came from, for example `hn-hiring`, `remoteok`, `website`, `referral`. The report shows which sources produce deals |
| `value`, `currency` | Expected deal value. Currency is a 3-letter code, default `USD` |
| `deal_title` | Defaults to the company name |
| `follow_up_in_days` | Creates a [reminder](./reminders.md) this many days from now |

## Listing and searching

`pipeline_list` shows open deals by default, most recently active first. Filter with `stage`,
`status` (`open`, `won`, `lost`, `all`), `source`, and `query`, which searches company, domain,
contact, email and deal title. If you pass a `stage` without a `status`, all statuses are shown.

| Sort | Order |
|---|---|
| `recent` (default) | Most recently active first |
| `stale` | Least recently active first, to find deals going cold |
| `value` | Highest value first |

`limit` is 1-100, default 25.

## The report

`pipeline_report` answers "what should I do next?" with:

- Open deals and value by stage
- **Stale deals** with no activity in `stale_days` days (default 7)
- Follow-ups that are due or overdue
- Wins, losses and win rate over the last `days` days (1-365, default 30)
- Which lead sources produce deals and revenue
- The stage funnel

## Logging and follow-ups

`pipeline_log_activity` only records. It does not send anything. Each entry resets the deal's
staleness clock. Types are `note` (default), `email`, `call`, `meeting`, `proposal` and `other`.

`pipeline_add_lead`, `pipeline_update` and `pipeline_log_activity` all accept `follow_up_in_days`
to schedule a follow-up. Follow-ups are reminders, so they are announced on Telegram when you have
it set up. See [Reminders](./reminders.md).

When you lose a deal, pass `lost_reason` to `pipeline_update`. It is kept with the deal.

## Exporting

`pipeline_export` writes `deals` (default) or `contacts` to a CSV file you can open in Excel or
Google Sheets. It refuses to replace an existing file unless you pass `overwrite: true`. The
`path` must be inside your workspace if you have a [workspace limit](../security.md#workspace-limit).

## Deleting

`pipeline_delete_deal` removes the deal with its timeline and follow-ups. The company and contacts
stay. Prefer moving a deal to `lost`, which keeps the history.

## Examples

```text
"Find companies hiring React developers and add the best three to my pipeline."
```
Claude calls [`lead_hn_hiring`](./leads.md), picks the best matches, and calls
`pipeline_add_lead` for each with `source: "hn-hiring"`.

```text
"What should I focus on this week?"
```
Claude calls `pipeline_report` and lists stale deals and due follow-ups.

```text
"Acme replied, they want a call Friday. Move them forward and remind me Thursday."
```
Claude calls `pipeline_update` with `stage: "replied"` and a follow-up.

## Known limitations

- Data is local and single-user. There is no sync between machines. Use
  [`causly-server backup`](../cli.md#backup-and-restore) to keep a copy.
- Pipeline does not send email. To contact a lead, use [Gmail](./gmail.md) and log the result with
  `pipeline_log_activity`.
- Text in deal notes can come from web pages. Tool results are marked as data, not instructions.
