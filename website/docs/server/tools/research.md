---
sidebar_position: 1
---

# Research

2 tools to search the web and read pages as clean text. Other packs build on them, for example to
research a company before you add it to your [pipeline](./pipeline.md).

Research loads at startup by default. It works with no key.

## Tools

| Tool | Level | What it does |
|---|---|---|
| `web_search` | `READ` | Search the web. Returns titles, URLs and snippets |
| `web_fetch` | `MEDIUM` | Fetch a public page and return its readable text |

## web_search

| Argument | Notes |
|---|---|
| `query` | What to search for |
| `max_results` | 1-20, default 5 |
| `domains` | Only search these sites, for example `["github.com"]` |

Search uses [Tavily](https://tavily.com) when `TAVILY_API_KEY` is set. Tavily has a free tier and
gives better results. Without a key, Causly falls back to DuckDuckGo, which needs no account but
may be rate limited.

```bash
causly-server keys set TAVILY_API_KEY
```

## web_fetch

Fetches a public `http` or `https` page and returns its title, description and text.

| Argument | Notes |
|---|---|
| `url` | The page to read |
| `max_chars` | Characters of text to return, 500-30,000, default 8,000 |
| `include_links` | Also return up to 50 links from the page |

Private and local addresses are blocked, so `web_fetch` cannot be used to reach services on your
own network.

## Untrusted content

Web pages are written by other people, and some try to give instructions to AI agents. Results
from both tools are marked as untrusted, and your agent is told never to follow instructions found
in them. Keep this in mind when you let an agent act on what it reads, and keep `confirm`
decisions with you. See [Security](../security.md#what-is-not-protected).

## Examples

```text
"Search for open-source alternatives to Calendly and summarise the top three."
```

```text
"Read acme.com/about and tell me what they do."
```
