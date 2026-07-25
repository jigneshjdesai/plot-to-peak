# Reviews & Contact Forms — Setup

Two new features were added:

1. **Reviews** — a scrolling reviews banner (below the hero) + a **Reviews** section with a
   moderated review grid and a “Leave a Review” form.
2. **Contact form** — a message form with **SMS** and **email** marketing-consent checkboxes.

Both submit through **Formspree** (a free form backend — no server needed). You stay in control:
review submissions are emailed to you, and **you choose which appear on the site**.

---

## What to edit

### 1. Form destination + Google link — `assets/site-config.js`

| Setting | What to paste | Where to get it |
|--------|----------------|-----------------|
| `formspreeEndpoint` | Your Formspree form URL, e.g. `https://formspree.io/f/abcdwxyz` | Sign up free at <https://formspree.io>, create a form, connect `plottopeak@gmail.com`, copy the endpoint. |
| `googleReviewUrl` | Your Google “write a review” link, e.g. `https://g.page/r/XXXX/review` | Google Business Profile → **Ask for reviews** → copy link. |

Until you set `formspreeEndpoint`, the forms show a “not connected — email/call us” message.
Until you set `googleReviewUrl`, the “Review us on Google” button is disabled.

### 2. Which reviews appear on the site — `assets/reviews.json`

This file feeds **both** the scrolling banner and the Reviews grid. It currently holds a few
**EXAMPLE** entries so you can see the layout — **replace them with real reviews before launch.**

Each entry:
```json
{ "name": "Sarah M.", "rating": 5, "text": "Great job on our gutters!", "location": "Plano, TX" }
```
When a real review arrives by email (from the site form or elsewhere), add an approved one here,
commit, and it appears automatically. If the list is empty, the scrolling banner hides itself.

---

## How submissions flow

1. Customer fills the review or contact form → **Formspree emails you** the details
   (including which consent boxes were ticked and a `submitted_at` timestamp).
2. For reviews: if it’s good, add it to `assets/reviews.json` to publish it.
3. For consent: add opted-in contacts to your email/SMS tool (or **Jobber Campaigns**).

### Compliance notes (please read)
- The SMS checkbox uses opt-in wording with “reply STOP to opt out” and “msg & data rates may
  apply.” Make sure your texting provider actually honors STOP/opt-outs.
- Consent is recorded per submission (value + timestamp). Keep those emails as your proof of consent.
- Consent is optional and not a condition of service (stated on the form).

---

## Want me to finish it?
Send me your **Formspree endpoint** and **Google review link** and I’ll paste them in and push.
Send me **real reviews** (name, rating, city, comment) and I’ll load them into `reviews.json`.
