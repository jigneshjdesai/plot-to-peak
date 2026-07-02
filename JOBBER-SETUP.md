# Connecting the Website to Jobber — Where to Paste Your Credentials

This site is set up to use **Jobber** for **Estimates, Invoices, and Payments**.
There are two levels. **You only need Level 1** to go live.

---

## ✅ Level 1 — No backend (what the website uses now)

This powers the new **“Estimates · Invoices · Payments”** section, the
**Request an Estimate** buttons, and the **Client Hub / Pay** buttons.

**Edit ONE file:** [`assets/jobber-config.js`](assets/jobber-config.js)

Paste these two values from your Jobber account:

| # | Setting in `jobber-config.js` | Where to find it in Jobber |
|---|-------------------------------|----------------------------|
| 1 | `clientHubUrl` | **Jobber → Settings → Client Hub** (copy the Client Hub web address). This is where customers approve quotes, view invoices, and **pay online**. |
| 2 | `requestFormClientHubId` | **Jobber → Settings → Request form → “Add request form to your website.”** In the code snippet Jobber shows, copy the value inside `clienthub_id="..."`. |

That's it. Until you paste them:
- the **Request an Estimate** area shows a friendly “call/email us” fallback, and
- the **Client Hub / Pay** buttons are shown as disabled.

Once pasted and pushed, the embedded Jobber request form appears automatically
and every button points to your real Jobber Client Hub.

> Tip: If Jobber's embed snippet uses a different script URL or a custom
> `form_url`, you can also set `embedScriptSrc` / `requestFormUrl` in the same file.
> These values are **public** and safe to ship in a website.

---

## 🔧 Level 2 — Optional backend (only if you need the Jobber API)

Needed **only** if you later want your own code to *create* quotes/invoices or
read payment status automatically. Requires a small server because it uses secret
keys that must not live in a website.

**Folder:** [`integration/`](integration/) — full instructions in
[`integration/README.md`](integration/README.md).

**Edit ONE file:** `integration/.env` (copy it from `integration/.env.example`)

| Setting in `.env` | Where to find it |
|-------------------|------------------|
| `JOBBER_CLIENT_ID` | **developer.getjobber.com → My Apps → your app** |
| `JOBBER_CLIENT_SECRET` | same app page (keep this secret!) |
| `JOBBER_REDIRECT_URI` | must match the Redirect URI you set on the Jobber app |
| `JOBBER_API_VERSION` | the API version date from the Jobber docs |
| `SESSION_SECRET` | any long random string you generate |

⚠️ **Never commit the real `integration/.env`** — it's already gitignored.

---

## Quick reference: which file do I edit?

| I want to… | Edit this file |
|------------|----------------|
| Show the request form + Client Hub/Pay buttons on the site | `assets/jobber-config.js` (Level 1) |
| Create quotes/invoices from my own code via the API | `integration/.env` + deploy `integration/` (Level 2) |

Questions or want me to wire the values in for you once you have them? Just send
the two Level‑1 values and I'll drop them in and push.
