---
sidebar_position: 3
---

# Telegram

5 tools to alert yourself on Telegram and read messages sent to your bot. It also delivers your
[reminders](./reminders.md).

Telegram is an on-demand pack. Add it to startup with `causly-server toolsets add telegram`, or
let your agent call its tools through `use_tool`.

## Setup

Telegram uses a bot token, not OAuth.

1. In Telegram, open [@BotFather](https://t.me/BotFather), send `/newbot`, and pick a name and
   username.
2. Copy the token it gives you.
3. Open your new bot and press **Start**, so it can see your chat.

```bash
causly-server setup telegram
```

Setup checks the token live. After you message the bot, your chat id is found automatically and
saved as `TELEGRAM_CHAT_ID`. If you prefer to do it by hand, message the bot and call
`telegram_get_updates` to read your chat id.

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | The token from BotFather |
| `TELEGRAM_CHAT_ID` | Your own chat id. `telegram_notify` writes here |

## Tools

| Tool | Level | What it does |
|---|---|---|
| `telegram_get_me` | `READ` | Check the bot token and show the bot's name. Also says whether `TELEGRAM_CHAT_ID` is set |
| `telegram_get_updates` | `READ` | Read recent messages people sent to the bot, oldest first |
| `telegram_get_chat` | `READ` | Details of one chat: type, title or name, username |
| `telegram_notify` | `LOW` | Send a message to **your own** chat |
| `telegram_send_message` | `HIGH` | Send a message to any chat, group or channel. Needs `confirm: true` |

## Alerting yourself

`telegram_notify` sends to `TELEGRAM_CHAT_ID` only, so it can only ever reach you. That is why it
needs no confirmation. Use it for alerts: a lead replied, a follow-up is due, a deploy failed, a
task finished.

| Argument | Notes |
|---|---|
| `text` | Up to 4,096 characters |
| `silent` | Deliver without a sound |
| `parse_mode` | `HTML` or `MarkdownV2`. Leave it out for plain text, which is safest |

## Reading messages

`telegram_get_updates` returns recent messages sent to the bot, and posts in channels where it is
an admin. `limit` is 1-100, default 20. Pass `offset` (the `next_offset` from the last call) to mark
earlier messages as read.

Message text comes from other people. Results are marked as data and your agent is told never to
follow instructions inside them.

## Sending to others

`telegram_send_message` reaches other people, so it is `HIGH` risk. Your agent must ask you first
and then call it with `confirm: true`. `chat_id` is a number (groups are negative) or
`@channelname`. `reply_to_message_id`, `silent` and `parse_mode` are optional. For messages to
yourself, use `telegram_notify`.

## Rate limits and errors

Telegram limits how fast one bot can send. Causly does not retry failed calls on its own. A rate-limit error says how long to wait (`Try again in 42s`), a timeout is 20 seconds, and every error message includes the fix. See [Errors from services](../troubleshooting.md#errors-from-services-github-gmail-calendar-slack-telegram). When Telegram says how long to wait, the message uses its number.

## Examples

```text
"Alert me on Telegram when the deploy finishes."
```

```text
"Did anyone message my bot today?"
```
