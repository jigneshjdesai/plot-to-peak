/* =============================================================================
   Jobber API client — OAuth 2.0 + GraphQL
   -----------------------------------------------------------------------------
   Docs: https://developer.getjobber.com/docs/
   Requires Node.js 18+ (built-in global fetch).

   This module holds NO credentials. It reads them from environment variables
   (see .env.example). Import it from a server (see server-example.js).
   ============================================================================= */

import fs from "node:fs";

const AUTHORIZE_URL = "https://api.getjobber.com/api/oauth/authorize";
const TOKEN_URL     = "https://api.getjobber.com/api/oauth/token";
const GRAPHQL_URL   = "https://api.getjobber.com/api/graphql";

function env(name, required = true) {
  const v = process.env[name];
  if (required && (!v || v.includes("<<"))) {
    throw new Error(`Missing/placeholder env var ${name} — set it in integration/.env`);
  }
  return v;
}

/* ---------------------------------------------------------------------------
   STEP 1 — Send the user to Jobber to authorize your app.
   `state` is a random value you generate and later verify in the callback.
--------------------------------------------------------------------------- */
export function buildAuthorizeUrl(state) {
  const params = new URLSearchParams({
    client_id: env("JOBBER_CLIENT_ID"),
    redirect_uri: env("JOBBER_REDIRECT_URI"),
    response_type: "code",
    state
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

/* ---------------------------------------------------------------------------
   STEP 2 — Exchange the `code` from the callback for access + refresh tokens.
--------------------------------------------------------------------------- */
export async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    client_id: env("JOBBER_CLIENT_ID"),
    client_secret: env("JOBBER_CLIENT_SECRET"),
    grant_type: "authorization_code",
    code,
    redirect_uri: env("JOBBER_REDIRECT_URI")
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return res.json(); // { access_token, refresh_token, expires_in, ... }
}

/* ---------------------------------------------------------------------------
   Refresh an expired access token using the stored refresh token.
--------------------------------------------------------------------------- */
export async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: env("JOBBER_CLIENT_ID"),
    client_secret: env("JOBBER_CLIENT_SECRET"),
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/* ---------------------------------------------------------------------------
   Call the Jobber GraphQL API with a valid access token.
--------------------------------------------------------------------------- */
export async function graphql(accessToken, query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      // Jobber's API is versioned — send the version you developed against.
      "X-JOBBER-GRAPHQL-VERSION": env("JOBBER_API_VERSION")
    },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) throw new Error("GraphQL error: " + JSON.stringify(json.errors));
  return json.data;
}

/* ---------------------------------------------------------------------------
   Simple local token storage (TESTING ONLY).
   Replace with a database / secret manager for production.
--------------------------------------------------------------------------- */
export function saveTokens(tokens) {
  fs.writeFileSync(env("TOKEN_STORE_PATH", false) || "./.jobber-tokens.json",
    JSON.stringify(tokens, null, 2));
}
export function loadTokens() {
  const path = env("TOKEN_STORE_PATH", false) || "./.jobber-tokens.json";
  if (!fs.existsSync(path)) return null;
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

/* =============================================================================
   EXAMPLE OPERATIONS
   -----------------------------------------------------------------------------
   IMPORTANT: Jobber's GraphQL schema evolves. Treat the queries below as a
   STARTING SCAFFOLD and confirm exact type/field/mutation names + required
   inputs against the live schema explorer before relying on them:
     https://developer.getjobber.com/docs/  →  API reference / GraphQL explorer
   In Jobber's schema, quotes are the "estimates" you send to clients.
   ============================================================================= */

// Create a QUOTE (estimate) for an existing client. Returns the new quote.
export async function createQuote(accessToken, { clientId, title, message, lineItems }) {
  const mutation = `
    mutation CreateQuote($input: QuoteCreateInput!) {
      quoteCreate(input: $input) {
        quote { id quoteNumber }
        userErrors { message path }
      }
    }`;
  const input = { clientId, title, message, lineItems };
  return graphql(accessToken, mutation, { input });
}

// Create an INVOICE for an existing client. Returns the new invoice.
export async function createInvoice(accessToken, { clientId, message, lineItems }) {
  const mutation = `
    mutation CreateInvoice($input: InvoiceCreateInput!) {
      invoiceCreate(input: $input) {
        invoice { id invoiceNumber }
        userErrors { message path }
      }
    }`;
  const input = { clientId, message, lineItems };
  return graphql(accessToken, mutation, { input });
}

// Read an invoice's payment status (to reconcile Jobber Payments in your app).
export async function getInvoice(accessToken, invoiceId) {
  const query = `
    query GetInvoice($id: EncodedId!) {
      invoice(id: $id) {
        id
        invoiceNumber
        invoiceStatus
        amounts { total depositAmount }
      }
    }`;
  return graphql(accessToken, query, { id: invoiceId });
}
