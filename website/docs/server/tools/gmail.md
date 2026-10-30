---
sidebar_position: 12
---

# Gmail

8 tools using the Gmail API with OAuth2 — search, read, send, reply, forward. Implemented in
`tools/gmailOps.js`.

## Setup

Gmail uses OAuth2 instead of a simple API key, because access is tied to a specific Google
account. Gmail, [Calendar](./calendar.md) and Search Console share one OAuth client that you
create once:

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project or pick an
   existing one.
2. Enable the **Gmail API**.
3. Under **Google Auth Platform**, fill in **Branding**, and under **Audience** choose
   **External** and add your own Google account as a test user.
4. Under **Clients**, create a client of type **Desktop app**. A "Web application" client fails
   with `redirect_uri_mismatch`.
5. Save the client id and secret: `causly-server setup gmail`.
6. Sign in once in your browser:

```bash
causly-server login google
```

This saves `GMAIL_REFRESH_TOKEN` for you. While your Google app is in Testing status, Google
expires the token every 7 days. Run `causly-server login google` again to renew it, or publish
the app in **Audience** to stop the expiry. See [Environment variables](../configuration.md#google).

## Tools

| Tool | Risk | What it does |
|---|---|---|
| `gmail_get_profile` | READ | Get the authenticated account's profile — connectivity check |
| `gmail_search` | READ | Search messages using Gmail search syntax (`from:`, `subject:`, etc.) |
| `gmail_list_messages` | READ | List recent messages, optionally scoped to a label |
| `gmail_get_message` | READ | Get a single message's decoded content by message ID |
| `gmail_get_thread` | READ | Get a full thread (all messages in it) by thread ID |
| `gmail_send` | HIGH | Send a new email |
| `gmail_reply` | HIGH | Reply to an existing message in the same thread |
| `gmail_forward` | HIGH | Forward an existing message to a new recipient |

## Example

```
"Find the latest email from our Vercel billing alerts and forward it to me
with a summary."
```

Claude calls `gmail_search` with a query like `from:vercel.com subject:billing` →
`gmail_forward` (confirm: true) with the matched message ID.
