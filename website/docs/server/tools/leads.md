---
sidebar_position: 2
---

# Leads

3 tools to find companies that need what you build. They search public sources, need no API key,
and feed straight into the [pipeline](./pipeline.md).

Leads loads at startup by default.

## Tools

| Tool | Level | What it does |
|---|---|---|
| `lead_hn_hiring` | `READ` | Search the latest Hacker News "Who is hiring?" thread |
| `lead_remote_jobs` | `READ` | Search remote job listings from RemoteOK and We Work Remotely |
| `lead_company_contacts` | `MEDIUM` | Find public contact details on a company's own website |

A company hiring for a skill is a good prospect for freelance or agency work in that skill.

## lead_hn_hiring

Searches the most recent monthly "Who is hiring?" thread by keyword. Each post includes the
company, the text, links and any contact emails.

| Argument | Notes |
|---|---|
| `query` | Keywords, for example `react contract remote` or `django agency` |
| `limit` | 1-30 posts, default 10 |
| `thread_id` | Search a specific thread instead of the latest |

## lead_remote_jobs

Searches [RemoteOK](https://remoteok.com) and
[We Work Remotely](https://weworkremotely.com) (programming), newest first.

| Argument | Notes |
|---|---|
| `query` | Keywords, for example `react` or `devops`. Every word must match |
| `limit` | 1-30 jobs, default 10 |

Link back to the job URL when you share a result.

## lead_company_contacts

Reads a company's homepage and up to a few contact and about pages on the **same site**, and
returns:

- emails, each marked as a shared mailbox (such as `info@`) or not
- phone numbers
- LinkedIn, X and GitHub links
- the company name

| Argument | Notes |
|---|---|
| `url` | Company website or domain, for example `acme.com` |
| `max_pages` | Extra contact and about pages to read, 0-5, default 3 |

It returns public business details only. Check the rules where you and the company are before
cold outreach.

## Examples

```text
"Find companies hiring React developers and add the best three to my pipeline."
```
Claude calls `lead_hn_hiring` and `lead_remote_jobs`, then `lead_company_contacts` for the
promising ones, then [`pipeline_add_lead`](./pipeline.md) with `source: "hn-hiring"`.

```text
"Who is hiring Django agencies this month?"
```

## Untrusted content

Posts and job listings are written by other people. Results are marked as untrusted, and your
agent is told not to follow instructions found in them.
