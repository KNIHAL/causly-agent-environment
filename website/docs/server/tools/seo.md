---
sidebar_position: 3
---

# SEO

4 tools for keyword research, page audits, draft checks and your real search performance from
Google Search Console.

SEO loads at startup by default. Three of the four tools need no key. Only
`seo_search_console` needs a Google sign-in.

## Tools

| Tool | Level | What it does |
|---|---|---|
| `seo_keyword_ideas` | `READ` | Keyword ideas for a topic from search autocomplete |
| `seo_page_audit` | `MEDIUM` | On-page SEO audit of a live URL |
| `seo_content_check` | `READ` | Check a draft before you publish it |
| `seo_search_console` | `READ` | Your own site's queries, pages, clicks and positions |

## seo_keyword_ideas

Collects suggestions from Google, Bing and DuckDuckGo autocomplete. Results are long-tail phrases,
questions and comparisons, each tagged with search intent.

There is **no search volume**. Instead each keyword has `best_rank` (1 means the most popular
suggestion) and the number of sources that agree. Treat both as rough demand signals.

| Argument | Notes |
|---|---|
| `seed` | Topic or head keyword, for example `freelance web developer` |
| `expand` | `none` is just the seed. `questions` (default) adds how, what, best, for, vs and cost variants. `alphabet` adds the seed with a to z. `all` does both |
| `sources` | `google`, `bing`, `duckduckgo`. Default `google` and `bing` |
| `country`, `language` | For Google. Defaults `us` and `en` |
| `limit` | 1-200, default 50 |

Higher `expand` levels send more requests.

## seo_page_audit

Audits a live page and returns warnings and tips. It checks title and meta description length,
headings, canonical and robots tags, word count, images without alt text, internal and external
links, structured data and Open Graph tags. Pass `keyword` to check where it appears on the page.

## seo_content_check

Checks a draft in markdown or plain text before you publish: word count, reading time and ease,
sentence and paragraph length, headings, links, image alt text, and where your target keyword
appears. Optionally check a planned `title` and `meta_description` too. It runs locally and sends
nothing anywhere.

## seo_search_console

Your own site's real performance from Google Search Console: queries, pages, clicks, impressions,
CTR and average position.

Setup:

```bash
causly-server login google all
```

This signs in to Gmail, Calendar and Search Console. See [`login google`](../cli.md#login-google).

| Argument | Notes |
|---|---|
| `site` | A property such as `sc-domain:example.com` or `https://example.com/`. Omit it to list your properties |
| `days` | 1-90, default 28. Search Console data lags by about 2 days |
| `dimensions` | Any of `query`, `page`, `country`, `device`, `date`. Default `["query"]` |
| `limit` | 1-1000, default 25 |
| `query_contains`, `page_contains` | Filter rows |
| `quick_wins` | Only queries at positions 4-20, most impressions first. These are the ones likely to move up |
| `min_impressions` | Impressions floor for `quick_wins`, default 20 |

## Examples

```text
"Audit https://acme.com/pricing for the keyword 'invoice software' and tell me what to fix."
```

```text
"Which queries am I almost ranking for? Show quick wins from Search Console."
```

```text
"Check this blog draft for SEO before I publish it."
```
