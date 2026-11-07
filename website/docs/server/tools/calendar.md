---
sidebar_position: 16
---

# Calendar

8 tools for Google Calendar: read events, check free/busy, find meeting slots, and create, update
or delete events. Implemented in `tools/calendarOps.js` using the Calendar REST API v3 over
`fetch`, so there are no extra dependencies.

Calendar is an on-demand pack. Add it to startup with `causly-server toolsets add calendar`, or let
your agent call its tools through `use_tool`.

## Setup

Calendar shares one Google OAuth client with [Gmail](./gmail.md) and Search Console.

1. In your Google Cloud project, enable the **Google Calendar API**.
2. Create an OAuth client of type **Desktop app** and save its id and secret with
   `causly-server setup gmail`. See [Environment variables](../configuration.md#google).
3. Sign in once in your browser:

```bash
causly-server login google
```

This saves `CALENDAR_REFRESH_TOKEN` with the scopes Calendar needs (`calendar.events` and
`calendar.readonly`). Check it with `causly-server doctor --test`.

| Variable | Required | Notes |
|---|---|---|
| `CALENDAR_REFRESH_TOKEN` | Yes | Saved by `login google` |
| `CALENDAR_CLIENT_ID`, `CALENDAR_CLIENT_SECRET` | No | Only if you want a different OAuth client from Gmail. Otherwise `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` are reused |
| `CAUSLY_TIMEZONE` | No | IANA timezone, for example `Asia/Kolkata`. Defaults to your computer's timezone |

Google expires the token after 7 days while your app is in Testing status.
`causly-server status` and `causly-server doctor` warn you from day 5. Run
`causly-server login google` again to renew it, or
[publish the app](./gmail.md#publish-your-google-app-stop-the-7-day-expiry) so it stops
expiring. Calendar and Gmail use the same Google app, so one publish covers both.

## Tools

| Tool | Confirmation | What it does |
|---|---|---|
| `calendar_list_calendars` | No | List the calendars this account can see, with ids, access level and timezone |
| `calendar_list_events` | No | List events in a range, in time order |
| `calendar_get_event` | No | Get one event in full: guests and their replies, location, description, Meet link |
| `calendar_free_busy` | No | Busy blocks for your calendar and, if shared with you, other people's |
| `calendar_find_slots` | No | Find free meeting windows inside working hours |
| `calendar_create_event` | When attendees are given | Create an event, optionally with guests and a Google Meet link |
| `calendar_update_event` | When the event has guests, or you add some | Change title, time, description or location; add guests or a Meet link |
| `calendar_delete_event` | Always (`DESTRUCTIVE`) | Delete an event. Guests are notified of the cancellation |

## Time formats

Every time argument accepts three forms:

| Form | Example | Meaning |
|---|---|---|
| Date | `2026-10-23` | A whole day |
| Local time | `2026-10-23T15:00` | Read in the `timezone` argument, or `CAUSLY_TIMEZONE` |
| Full timestamp | `2026-10-23T15:00:00+05:30` | Exact moment, with an offset or `Z` |

For ranges, `when` accepts `today`, `tomorrow` or `next_7_days`. Or pass `from` and `to`. A bare
`to` date includes that whole day.

## Finding a time

`calendar_find_slots` returns free windows inside working hours, never in the past.

- Working hours default to 09:00-18:00, Monday to Friday. Change them with `work_start`,
  `work_end` and `weekdays_only`.
- `duration_minutes` is 5-480, default 30.
- Pass guests' emails as `attendees` to find a time that suits them too. If a guest's calendar is
  not shared with you, the result carries a warning that their busy times were **not** considered.
- The range is limited to 31 days.

`calendar_free_busy` returns only busy blocks, never event details, for your calendar and any
shared calendars you pass as `attendees`.

## Safety behavior

- **Inviting people needs confirmation.** `calendar_create_event` with `attendees`, and
  `calendar_update_event` on an event that has guests (or when adding some), refuse to run
  without `confirm: true`, because Google emails real people. Claude asks you first.
- **Events without guests are not confirmed.** Creating or editing an event on only your own
  calendar sends nothing, so it runs directly.
- **Overlap warning.** `calendar_create_event` checks for overlapping events and includes an
  `overlaps_with` list in the result. The event is still created.
- **Event text is untrusted.** Titles, descriptions and locations come from other people. Results
  carry a notice so Claude treats them as data, not instructions.
- **Deleting notifies guests.** `calendar_delete_event` sends cancellations when the event has
  guests, and is gated behind `confirm: true` like every `DESTRUCTIVE` tool.

## Examples

```
"What's on my calendar tomorrow?"
```
Claude calls `calendar_list_events` with `when: "tomorrow"`.

```
"Find a 45-minute slot this week that works for priya@example.com, and book it with a Meet link."
```
Claude calls `calendar_find_slots` with `attendees`, proposes a window, and after you agree calls
`calendar_create_event` with `add_meet_link: true` and `confirm: true`.

```
"Push my 3pm to 4pm."
```
Claude calls `calendar_update_event` with the new `start`. Moving only the start keeps the
event's original length.

## Recurring events

A recurring event is a series plus its occurrences. `calendar_list_events` returns each occurrence
with its own id. `calendar_update_event` and `calendar_delete_event` take an optional `scope`:

| `scope` | What changes | Default for |
| --- | --- | --- |
| `this` | Only the occurrence whose id you pass | An occurrence id |
| `following` | That occurrence and every later one | |
| `all` | The whole series | A series id |

- **`all` from an occurrence** finds the series and changes it. A new time moves the whole series by
  the same amount (an occurrence moved from 10:00 to 11:00 means every occurrence is at 11:00); the
  series keeps its own first date. An all-day series moves by whole days.
- **`following`** ends the old series one second before this occurrence (an all-day series ends the
  day before) and, for an update, starts a new series here with your changes. The new series is
  created first, and removed again if the old one cannot be ended, so you never end up with missing
  or doubled occurrences. A series limited by `COUNT` keeps the right number of remaining
  occurrences. From the first occurrence it is the same as `all`. For a delete there is no new
  series: the later occurrences are simply gone.
- **A series id** cannot be used with `this` or `following`: there is no single occurrence to pick.
  You get a clear error and nothing is sent.
- **Guests.** Changing or deleting a series with guests still needs `confirm: true`, as for any
  event, and guests of the series are the ones notified.
- An occurrence id without `scope` behaves as before (only that occurrence), and the result reminds
  Claude that `following` and `all` exist.

```
"Move my Monday standup to 11:00 from next week on."
```
Claude calls `calendar_update_event` with the occurrence id, the new `start` and `scope: "following"`.

## Rate limits and errors

Causly does not retry failed calls on its own. A rate-limit error says how long to wait (`Try again in 42s`), a timeout is 20 seconds, and every error message includes the fix. See [Errors from services](../troubleshooting.md#errors-from-services). A deleted event gives `That event was already deleted.`

## Known limitations

- Splitting a series with `scope: "following"` creates a new series for the later occurrences. Its
  guests are invited again, so their earlier replies do not carry over, and a Meet link is not
  copied (ask for a new one with `add_meet_link`). Exceptions you made to single later occurrences
  (a renamed or moved one) are not carried into the new series.
- A series cannot be switched between all-day and timed with `scope: "all"`. Use `scope: "this"`.
- Attendee limits: at most 50 guests per call, and each must be a valid email address.
- `calendar_find_slots` and `calendar_free_busy` can only see calendars that are shared with the
  authenticated account.
- A `403` from Google means the refresh token is missing a scope, or the Calendar API is not
  enabled in the Google Cloud project. A `401` means `CALENDAR_REFRESH_TOKEN` is wrong or expired.
