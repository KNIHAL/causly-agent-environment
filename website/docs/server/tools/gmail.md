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

This saves `GMAIL_REFRESH_TOKEN` for you, and the day it was saved. While your Google app is in
Testing status, Google expires the token every 7 days. `causly-server status` and
`causly-server doctor` warn you from day 5. Run `causly-server login google` again to renew it, or
publish the app as described below to stop the expiry. See
[Environment variables](../configuration.md#google).

## Publish your Google app (stop the 7-day expiry)

A new Google OAuth app starts in **Testing** status, and Google expires its sign-ins after 7 days.
Publishing the app to production removes that expiry. This is a step in your own Google Cloud
project, and Causly cannot do it for you. Google changes the console from time to time, so a menu
may be named slightly differently.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the project you made
   the OAuth client in.
2. Open **Google Auth Platform**, then **Branding**. Fill in the **App name**, **User support
   email** and **Developer contact information**. Google asks for these before it lets you publish.
   Save.
3. Open **Audience**. Under **Publishing status**, press **Publish app** and confirm. The status
   changes from **Testing** to **In production**.
4. Check **Data access**: the scopes `causly-server login google` asks for (Gmail, Calendar,
   and Search Console if you use it) should be listed. If one is missing, add it.
5. Sign in again, because a token saved while the app was in Testing can still expire:

   ```bash
   causly-server login google
   ```

   Google may say the app is not verified. This is your own app: choose **Advanced**, then
   **Go to the app (unsafe)**, tick every permission box and press **Allow**. For personal use you
   do not need to submit it for verification. Until it is verified Google limits an app to 100
   users, which does not matter for your own account.
6. Tell Causly the expiry is gone, so it stops warning you:

   ```bash
   causly-server keys set CAUSLY_GOOGLE_PUBLISHED
   ```

   Enter `true` at the prompt.

A published app's sign-in still stops working if you remove the app's access at
[myaccount.google.com/permissions](https://myaccount.google.com/permissions), change your Google
password in some setups, or leave it unused for six months. Then run `causly-server login google`
again.

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

## Rate limits and errors

Google limits how fast Gmail can be called. Causly does not retry failed calls on its own. A rate-limit error says how long to wait (`Try again in 42s`), a timeout is 20 seconds, and every error message includes the fix. See [Errors from services](../troubleshooting.md#errors-from-services). An expired Google sign-in gets its own message that points to `causly-server login google`.

## Example

```
"Find the latest email from our Vercel billing alerts and forward it to me
with a summary."
```

Claude calls `gmail_search` with a query like `from:vercel.com subject:billing` →
`gmail_forward` (confirm: true) with the matched message ID.
