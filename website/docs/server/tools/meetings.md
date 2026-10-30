---
sidebar_position: 1
---

# Meetings

9 tools to turn calls into searchable notes and action items. Transcribe a recording, save a
summary and decisions, track who owes what, and get a briefing before the next call. Everything is
stored in your local database.

Meetings loads at startup by default. Transcription needs a Groq key. Everything else needs no
key.

## Setup

Only transcription needs a key:

```bash
causly-server setup groq
```

Groq has a free tier. See [Environment variables](../configuration.md#services) for
`GROQ_API_KEY`, `GROQ_WHISPER_MODEL` and `GROQ_MAX_FILE_MB`. Recordings over 25 MB need
[`ffmpeg`](https://ffmpeg.org) on your `PATH`, and are compressed before upload.

Other pieces are optional: [Calendar](./calendar.md) fills in guests and times, and the
[pipeline](./pipeline.md) links meetings to deals.

## Tools

| Tool | Level | What it does |
|---|---|---|
| `meeting_transcribe` | `HIGH` | Transcribe a recording with Groq Whisper and keep it as a **draft**. Needs `confirm: true` |
| `meeting_save` | `MEDIUM` | Save notes: summary, decisions and action items. Completes a draft or creates a meeting |
| `meeting_list` | `READ` | List meetings, newest first, with open action item counts |
| `meeting_get` | `READ` | One meeting in full, optionally with the transcript |
| `meeting_search` | `READ` | Find what was said or decided across all meetings |
| `meeting_actions` | `READ` | Action items across all meetings, soonest due first, overdue flagged |
| `meeting_complete_action` | `LOW` | Mark an action item done, or reopen it |
| `meeting_prep` | `READ` | A briefing before a call |
| `meeting_delete` | `DESTRUCTIVE` | Delete a meeting, its transcript and action items. Needs `confirm: true` |

## From recording to notes

1. **Transcribe.** The agent calls `meeting_transcribe` with the file path. This **uploads the
   audio to Groq**, so it requires `confirm: true`, and a good agent asks you first. The result is
   a draft meeting with the transcript.
2. **Save.** The agent reads the transcript and calls `meeting_save` with the returned
   `meeting_id`, adding a summary, decisions and action items.

Supported formats are mp3, m4a, wav, mp4, webm, ogg and flac. The file must be inside your
[workspace](../security.md#workspace-limit).

`meeting_transcribe` options:

| Argument | Notes |
|---|---|
| `path` | The recording |
| `title` | Defaults to the file name |
| `language` | ISO code such as `en` or `hi`. Default: auto-detect |
| `vocabulary` | Names and jargon to spell correctly, for example `Causly, Asha Rao, Stripe` |
| `started_at` | When the meeting began. Default: the file's time minus its length |
| `deal_id` | The pipeline deal this meeting belongs to |

## Saving notes without a recording

`meeting_save` also works without audio. Omit `meeting_id` to create a meeting from any of:

- a pasted `transcript`
- a `transcript_file` (`.txt`, `.md`, `.vtt` or `.srt`) inside your workspace
- just a `summary`

| Argument | Notes |
|---|---|
| `summary`, `decisions`, `attendees` | What was discussed, what was decided, and who was there |
| `action_items` | A list of `{ text, owner, due_date }`. It **replaces the open items** of this meeting. Finished items are kept |
| `calendar_event_id` | Fills in title, guests and time from Google Calendar |
| `deal_id` | Attaches a pipeline deal and logs the meeting on its timeline once. Pass `log_to_deal: false` to skip the log |
| `duration_minutes`, `started_at`, `language`, `title` | Optional details |

An action item with a `due_date` (`YYYY-MM-DD`) gets a [reminder](./reminders.md) at 09:00 that
day.

## Finding things

| Tool | Use it to |
|---|---|
| `meeting_list` | Browse. Filter by `deal_id`, `since` and `status` (`all`, `saved`, `draft`). `limit` is 1-100, default 20 |
| `meeting_search` | Search. Every word of the query must match somewhere in the title, summary, decisions, guests, action items or transcript. Each hit returns a snippet. `limit` 1-50, default 10 |
| `meeting_get` | Read one meeting. Set `include_transcript` for the transcript. It is paged: `transcript_from` is a character offset and `transcript_chars` is 1,000-100,000 (default 30,000) |

## Action items

`meeting_actions` answers "what do I owe people?" and "what is pending from them?". It lists items
across all meetings with the soonest due date first and overdue ones flagged. Filter by `status`
(`open` default, `done`, `all`), `owner` (part of a name), `meeting_id` and `due_before`.

`meeting_complete_action` marks an item done, which also clears its reminder. Pass `status: "open"`
to reopen it.

## Preparing for a call

`meeting_prep` builds a briefing from everything Causly knows. Give at least one of `event_id`
(a Google Calendar event), `deal_id`, `attendees` (emails) or `query` (a company or topic). It
returns:

- the calendar event, if there is one
- the pipeline deal for the guests: stage, next step and recent activity
- earlier meetings with them
- everything still open

## Examples

```text
"Transcribe D:\recordings\acme-call.mp3 and list the action items."
```
Claude asks to upload the audio, calls `meeting_transcribe` with `confirm: true`, then
`meeting_save` with a summary and action items.

```text
"Prep me for my next meeting."
```
Claude finds the event with [`calendar_list_events`](./calendar.md), then calls `meeting_prep`.

```text
"What did Acme say about pricing?"
```
Claude calls `meeting_search` and quotes the matching snippets.

## Privacy

Audio leaves your machine only when you confirm a `meeting_transcribe` call, and only to Groq.
Summaries, transcripts and action items are stored locally. Meeting text can contain words from
other people, so results are marked as data and not as instructions.

## Known limitations

- Transcription needs a Groq key and an internet connection. A local engine is not available yet.
- A transcript is only as good as the audio. Use `vocabulary` for names and product terms.
- Back up your notes with [`causly-server backup`](../cli.md#backup-and-restore).
