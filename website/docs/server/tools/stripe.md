---
sidebar_position: 1
---

# Stripe

9 tools to look up customers, draft and send invoices, create payment links, see payments and issue refunds, from a conversation.

Stripe is an on-demand pack. Add it to startup with `causly-server toolsets add stripe`, or let your agent call its tools through `use_tool`.

## Start in test mode

Use a **test** key first. A live key (`sk_live_...` or `rk_live_...`) is refused on purpose, so a live key pasted by mistake does nothing. The error says so and tells you how to switch:

```text
STRIPE_API_KEY is a LIVE key, which is blocked on purpose. Use a test key (sk_test_...).
To really work with live money, set STRIPE_ALLOW_LIVE=true.
```

Only set `STRIPE_ALLOW_LIVE=true` when you mean to work with real money. Every result includes `mode` (`test` or `live`) so the agent and you can see which one it was.

## Setup

1. In the Stripe dashboard, turn on **Test mode**, then open **Developers, API keys**.
2. Copy the secret key (`sk_test_...`) or a restricted key (`rk_test_...`).
3. Save it:

```bash
causly-server setup stripe
```

Setup checks the key live and shows `test mode account acct_...`.

| Variable | Required | What it does |
|---|---|---|
| `STRIPE_API_KEY` | Yes | The secret or restricted key |
| `STRIPE_ALLOW_LIVE` | No | `true` allows live keys. Leave it unset while testing |
| `STRIPE_DEFAULT_CURRENCY` | No | 3-letter code used when a tool is not given a currency. Default `usd` |

With a restricted key, give it only the permissions you need. If a tool is refused with a `403`, the message says the key may be missing a permission for that action.

## Tools

| Tool | Level | What it does |
|---|---|---|
| `stripe_get_account` | `READ` | Balance (available and pending) and whether the key is test or live. Also a connectivity check |
| `stripe_list_customers` | `READ` | Find customers by exact email, or by name. With neither, lists the newest |
| `stripe_create_customer` | `MEDIUM` | Create a customer from an email and/or a name. Does not email them |
| `stripe_list_invoices` | `READ` | Invoices with status, amounts and the hosted payment page link |
| `stripe_create_invoice` | `MEDIUM` | Create a **draft** invoice with line items. Nothing is sent or charged |
| `stripe_send_invoice` | `HIGH` | Finalize a draft and email it to the customer with a payment link |
| `stripe_create_payment_link` | `HIGH` | Create a public checkout link for a fixed amount |
| `stripe_list_payments` | `READ` | Recent payments, newest first |
| `stripe_refund` | `HIGH` | Refund a payment, in full or in part |

`HIGH` tools need your approval: a prompt in your client, or `confirm: true` where the client has no prompts. See [Security](../security.md#permission-levels).

## Amounts

Amounts are in **normal units**: `500` means 500.00, not 500 cents. Causly converts for you.

- Currencies without decimals (for example JPY) take whole numbers: `500` means 500 yen.
- Currencies with three decimals (for example KWD) allow three.
- An amount with more decimals than the currency has is refused, not rounded.
- Zero, negative and above-Stripe's-maximum amounts are refused.

## Customers

`stripe_list_customers` takes `email` (exact match) or `query` (part of the name), and `limit` from 1 to 100 (default 10).

Customer names and descriptions are typed by other people. Results are marked as data, and your agent is told never to follow instructions inside them.

## Invoices

Invoicing is two steps on purpose, so nothing reaches a customer by surprise.

1. **`stripe_create_invoice`** makes a draft. It takes:
   - `customer`: a customer id (`cus_...`) or an email. An unknown email creates the customer, and the result says `customer_created: true`
   - `items`: up to 20 lines, each with a `description` (up to 250 characters), an `amount` for one unit and an optional whole-number `quantity` from 1 to 10000
   - `currency`, `days_until_due` (1 to 90, default 14) and an optional `memo` (up to 1000 characters)

   If adding a line fails, the half-built draft is deleted so none is left behind.
2. **Review it**, then call **`stripe_send_invoice`** with the invoice id (`in_...`). It finalizes the invoice (it can no longer be edited) and emails it. A paid, void or uncollectible invoice, or one with no amount, is refused.

`stripe_list_invoices` filters by `customer` and `status` (`draft`, `open`, `paid`, `uncollectible` or `void`).

## Payment links

`stripe_create_payment_link` takes a `name` (what is being paid for), an `amount` and a `currency`. It creates a price and a link for one item. **Anyone with the link can pay**, so it is a `HIGH` tool.

## Payments and refunds

`stripe_list_payments` shows recent payments with their status, amount and amount received. Give a `customer` id to see one customer's.

`stripe_refund` takes the payment id (`pi_...`). Leave `amount` out for a full refund, or give a smaller amount for a partial one. An amount above what was received is refused, and so is a payment with nothing to refund. `reason` is optional: `duplicate`, `fraudulent` or `requested_by_customer`. The result says whether it was a full refund. **Money goes back to the customer and a refund cannot be undone.**

## What it does not do

There are no tools for subscriptions, products, prices, coupons, payouts or disputes. A sent invoice cannot be edited, voided or deleted from Causly: use the Stripe dashboard.

## Rate limits and errors

Each write is sent with its own idempotency key. Causly does not retry failed calls on its own: a rate-limit error says how long to wait (`Try again in 12s`), a timeout is 25 seconds for Stripe, and every error message includes the fix. A message never contains your key. See [Errors from services](../troubleshooting.md#errors-from-services).

## Examples

```text
"Show my Stripe balance and tell me if this is test mode."
```

```text
"Draft an invoice for asha@example.com: 3 hours of consulting at 120 USD. Don't send it yet."
```

```text
"Send invoice in_1Abc to the customer."
```

```text
"Refund 20 USD of payment pi_3Xyz because the customer asked."
```