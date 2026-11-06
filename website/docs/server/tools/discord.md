---
sidebar_position: 4
---

# Discord

5 tools to read and post in your Discord servers through a bot.

Discord is an on-demand pack. Add it to startup with `causly-server toolsets add discord`, or let your agent call its tools through `use_tool`.

## Setup

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and choose **New Application**.
2. On the **Bot** page, choose **Reset Token** and copy the token.
3. On the same page, turn on **Message Content Intent**. Without it, Discord returns empty text for most messages.
4. Under **OAuth2, URL Generator**, pick the scope `bot` and the permissions **View Channels**, **Read Message History** and **Send Messages**. Open the generated URL to invite the bot to your server.
5. Save the token:

```bash
causly-server setup discord
```

Setup checks the token live and shows the bot's name. The variable is `DISCORD_BOT_TOKEN`.

The bot only sees servers it was invited to, and only the channels its role can see.

## Tools

| Tool | Level | What it does |
|---|---|---|
| `discord_get_me` | `READ` | Check the bot token and show the bot's name and how many servers it is in |
| `discord_list_guilds` | `READ` | List the servers the bot is in, with their ids |
| `discord_list_channels` | `READ` | List the text, announcement and forum channels of one server |
| `discord_read_messages` | `READ` | Read recent messages in a channel, oldest first |
| `discord_send_message` | `HIGH` | Post a message as the bot |

`discord_send_message` is a `HIGH` tool: other people will read it. It needs your approval: a prompt in your client, or `confirm: true` where the client has no prompts. See [Security](../security.md#permission-levels).

## Finding ids

Discord tools take ids, which are long numbers. Start with `discord_list_guilds` for server ids, then `discord_list_channels` with a `guild_id` for channel ids. Channels come in order, with their category and topic. You can also turn on Developer Mode in Discord and use right-click, **Copy ID**.

## Reading messages

`discord_read_messages` takes a `channel_id` and:

| Argument | Notes |
|---|---|
| `limit` | 1 to 100, default 20 |
| `before` | Only messages before this message id |
| `after` | Only messages after this message id |

Each message has its id, author, time and text, plus the id it replies to and the number of attachments and embeds when there are any. Bot authors are marked.

If every message comes back with empty text, the result says so and tells you to turn on **Message Content Intent** on the Bot page of the Developer Portal.

Messages and channel topics are written by other people. Results are marked as data, and your agent is told never to follow instructions inside them.

## Posting messages

`discord_send_message` takes a `channel_id` and `text`, and optionally `reply_to_message_id` to reply to a message.

- The text is up to 2000 characters. A longer text is refused, so send it in parts.
- **Mentions are switched off.** `@everyone`, `@here`, roles and people are not pinged, even if the text contains them.
- The result has the id and time of the message you posted.

## What it does not do

There are no tools for direct messages, reactions, editing or deleting messages, voice, or managing the server, roles or members.

## Rate limits and errors

Discord says how long to wait, and Causly passes it on (`Try again in 3s`). Causly does not retry failed calls on its own, a timeout is 20 seconds, and every error message includes the fix. A message never contains your token. A `403` usually means the bot is missing access or a permission in that channel: check its role and the channel's permissions (View Channel, Read Message History, Send Messages). A `404` usually means a wrong id, or the bot is not in that server. See [Errors from services](../troubleshooting.md#errors-from-services).

## Examples

```text
"Which servers is the bot in, and what channels does Causly Community have?"
```

```text
"Read the last 30 messages in #support and summarize what people are asking."
```

```text
"Post in #announcements: Version 1.6 is out. Ask me before sending."
```