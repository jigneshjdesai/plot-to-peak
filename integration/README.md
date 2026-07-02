# Plot to Peak — Jobber API backend (optional)

This folder is **only needed if you want to create quotes/invoices or read
payment status _programmatically_** from the Jobber GraphQL API.

For most small businesses you do **not** need this. The website already
integrates with Jobber with **no backend** using:

- Jobber's **embedded request form** (captures estimate requests), and
- Jobber's **Client Hub** (where customers approve quotes, view invoices, and pay).

Those are configured entirely in [`../assets/jobber-config.js`](../assets/jobber-config.js)
— see [`../JOBBER-SETUP.md`](../JOBBER-SETUP.md).

Use this backend only if you later want your own systems to talk to Jobber directly.

---

## Why a backend is required for the API

The Jobber API uses OAuth 2.0 with a **Client ID and Client Secret**. A secret
must never be placed in website JavaScript (anyone could read it). So API calls
must run on a server you control (a small Node service, or a serverless function
on Vercel / Netlify / Cloudflare / AWS Lambda).

## Setup

1. Create a Jobber developer app: <https://developer.getjobber.com> → **My Apps → New App**.
2. Set the app's **Redirect URI** to your backend callback, e.g.
   `https://your-backend.example.com/api/jobber/callback`
   (or `http://localhost:3000/api/jobber/callback` for local testing).
3. Request the **scopes** you need (e.g. read/write **quotes**, **invoices**, **clients**).
4. Copy `.env.example` to `.env` and paste your **Client ID** and **Client Secret**.
5. Install and run:
   ```bash
   cd integration
   npm install
   npm start
   ```
6. Visit `http://localhost:3000/api/jobber/connect` once to authorize. Tokens are
   saved to `.jobber-tokens.json` (testing only — use a database in production).

## Endpoints (examples)

| Method | Path | Purpose |
|-------|------|---------|
| GET | `/api/jobber/connect` | Start OAuth (one-time authorize) |
| GET | `/api/jobber/callback` | OAuth redirect target |
| POST | `/api/estimates` | Create a quote/estimate `{ clientId, title, message, lineItems }` |
| POST | `/api/invoices` | Create an invoice `{ clientId, message, lineItems }` |
| GET | `/api/invoices/:id` | Read invoice + payment status |

## ⚠️ Important notes

- The GraphQL queries in [`jobber.js`](jobber.js) are a **starting scaffold**.
  Jobber's schema changes over time — confirm exact mutation/field names and
  required inputs in the live API reference / GraphQL explorer at
  <https://developer.getjobber.com/docs/> before going live.
- Add authentication to the `/api/*` routes before exposing them publicly.
- Never commit your real `.env` or `.jobber-tokens.json` (already gitignored).
