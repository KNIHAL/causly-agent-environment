---
sidebar_position: 2
---

# Reminders

3 tools for reminders and follow-ups that are saved locally, survive restarts, and reach you on
Telegram when they are due.

Reminders loads at startup by default. It needs no key. Add Telegram to get notified.

## Tools

| Tool | Level | What it does |
|---|---|---|
| `reminder_create` | `LOW` | Create a reminder. Give `due_at` (ISO 8601) or `in_hours` |
| `reminder_list` | `READ` | List reminders, soonest first |
| `reminder_update` | `LOW` | Mark done or cancelled, snooze, or edit the title or note |

`reminder_create` takes a `title`, plus either `due_at` (for example `2026-10-25T09:00:00+05:30`)
or `in_hours`. You can add a `note`, and a `deal_id` to link the reminder to a
[pipeline](./pipeline.md) deal.

`reminder_list` shows `pending` reminders by default. Use `status` (`pending`, `done`, `cancelled`
or `all`) and `due_only: true` to see only those whose time has come. `limit` is up to 200,
default 50.

`reminder_update` takes the reminder `id`. To snooze, pass a new `due_at` or `in_hours`.

## Where reminders come from

You can ask for a reminder directly, but most are created for you:

- A pipeline follow-up (`follow_up_in_days`) creates a reminder linked to the deal.
- A meeting [action item](./meetings.md#action-items) with a due date creates a reminder at 09:00
  that day.

## How you get notified

While any Causly Server process is running (your editor started it), a background job checks
reminders every minute. When one is due it is announced once. Anything already overdue is announced
a few seconds after the server starts.

If [Telegram](./telegram.md) is set up (`TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`), the reminder
is sent to your chat:

```text
Reminder: Follow up with Acme about the proposal
(deal #12)
```

Without Telegram, the reminder is only announced in the server's log, and you see it when you ask
for due reminders, for example "What is due this week?".

You may have Claude Desktop, Cursor and a custom agent running at once. The reminder is claimed in
the database, so exactly one of them sends it. You never get duplicates.

Reminders are only announced while a server process is running. If your editor is closed, you get
the notification when it next starts.

To stop reminders going to Telegram without removing Telegram, set `CAUSLY_REMINDER_NOTIFY=off`.

## Examples

```text
"Remind me to send the Acme proposal tomorrow at 10am."
```

```text
"What is due this week? Include meeting action items and reminders."
```
Claude combines `reminder_list`, [`meeting_actions`](./meetings.md) and
[`pipeline_report`](./pipeline.md).
