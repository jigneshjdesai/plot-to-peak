/* =============================================================================
   Reference server for the Plot to Peak <-> Jobber integration.
   -----------------------------------------------------------------------------
   This is a MINIMAL EXAMPLE to show the flow end to end. Before using it for
   real customers, add: authentication on the /api/* routes, input validation,
   HTTPS, persistent + encrypted token storage, and error monitoring.

   Run locally:
     1) cd integration
     2) cp .env.example .env   (then fill in your Jobber credentials)
     3) npm install
     4) npm start
     5) open http://localhost:3000/api/jobber/connect  to authorize once
   ============================================================================= */

import "dotenv/config";
import express from "express";
import crypto from "node:crypto";
import {
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  saveTokens,
  loadTokens,
  createQuote,
  createInvoice,
  getInvoice
} from "./jobber.js";

const app = express();
app.use(express.json());

// In-memory OAuth "state" store (use a signed cookie/session in production).
const pendingStates = new Set();

// Return a valid access token, refreshing it if we have a refresh token.
async function getAccessToken() {
  const tokens = loadTokens();
  if (!tokens) throw new Error("Not connected to Jobber yet. Visit /api/jobber/connect.");
  // For simplicity we refresh on every call. Optimise by checking expiry.
  if (tokens.refresh_token) {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    const merged = { ...tokens, ...refreshed };
    saveTokens(merged);
    return merged.access_token;
  }
  return tokens.access_token;
}

/* --- OAuth: kick off authorization ---------------------------------------- */
app.get("/api/jobber/connect", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  pendingStates.add(state);
  res.redirect(buildAuthorizeUrl(state));
});

/* --- OAuth: callback Jobber redirects back to ----------------------------- */
app.get("/api/jobber/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!state || !pendingStates.has(state)) return res.status(400).send("Invalid state.");
    pendingStates.delete(state);

    const tokens = await exchangeCodeForTokens(code);
    saveTokens(tokens);
    res.send("✅ Connected to Jobber. You can close this tab.");
  } catch (err) {
    res.status(500).send("OAuth error: " + err.message);
  }
});

/* --- Create an estimate (Jobber "quote") for an existing client ----------- */
app.post("/api/estimates", async (req, res) => {
  try {
    const token = await getAccessToken();
    const data = await createQuote(token, req.body); // { clientId, title, message, lineItems }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- Create an invoice for an existing client ----------------------------- */
app.post("/api/invoices", async (req, res) => {
  try {
    const token = await getAccessToken();
    const data = await createInvoice(token, req.body); // { clientId, message, lineItems }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- Read an invoice's payment status ------------------------------------- */
app.get("/api/invoices/:id", async (req, res) => {
  try {
    const token = await getAccessToken();
    const data = await getInvoice(token, req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Jobber integration server on http://localhost:${port}`));
