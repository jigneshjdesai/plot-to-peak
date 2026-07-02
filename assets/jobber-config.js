/* =============================================================================
   PLOT TO PEAK — JOBBER INTEGRATION CONFIG
   -----------------------------------------------------------------------------
   This is the ONLY file you need to edit to connect the website to Jobber.
   Replace each value wrapped in << >> with the value from your Jobber account.
   Full step-by-step instructions are in JOBBER-SETUP.md (repo root).

   Nothing here is secret — these are public IDs/URLs that are safe to ship in a
   website. Your private API keys (Client ID / Secret) are NOT used here; those
   belong only in the optional backend under /integration (see its README).
   ============================================================================= */

window.JOBBER_CONFIG = {

  /* (1) CLIENT HUB URL  ------------------------------------------------------
     Where your customers approve quotes, view invoices, and PAY online.
     In Jobber: Settings → Client Hub  (or open Client Hub and copy the address).
     It looks like:
       https://clienthub.getjobber.com/client_hubs/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/public/client/login
     Paste the full URL between the quotes below. */
  clientHubUrl: "https://clienthub.getjobber.com/client_hubs/5f338de3-6a9c-4917-bdbf-a373495065d7/login/new?source=share_login",

  /* (2) REQUEST FORM ID  -----------------------------------------------------
     The "clienthub_id" from your Jobber website request-form embed code.
     In Jobber: Settings → Request form  →  "Add request form to your website".
     Copy the value of  clienthub_id="..."  from the snippet Jobber shows you.
     (It is a long id like  1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d ) */
  requestFormClientHubId: "5f338de3-6a9c-4917-bdbf-a373495065d7",

  /* (3) OPTIONAL — full request form URL.
     Leave this as "" (empty) and it is built automatically from the id above.
     Only fill this if Jobber gives you a form_url that is different from the
     standard pattern. */
  requestFormUrl: "",

  /* (4) OPTIONAL — direct "Pay an invoice" link.
     Leave "" to send customers to the Client Hub (recommended). Only set this
     if Jobber gives you a dedicated payment link you want the Pay buttons to use. */
  paymentUrl: "",

  /* (5) OPTIONAL — the Jobber embed script URL.
     This is Jobber's public loader and normally does NOT need changing. If the
     snippet in your Jobber account shows a different src, paste it here. */
  embedScriptSrc: "https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js"
};


/* =============================================================================
   WIRING  —  you should not need to edit anything below this line.
   Reads the config above and connects the buttons + embeds the request form.
   ============================================================================= */
(function () {
  function isSet(v) {
    return typeof v === "string" && v.length > 0 && v.indexOf("<<") === -1;
  }

  function init() {
    var cfg = window.JOBBER_CONFIG || {};

    var hubUrl  = isSet(cfg.clientHubUrl) ? cfg.clientHubUrl : "";
    var payUrl  = isSet(cfg.paymentUrl) ? cfg.paymentUrl : hubUrl; // pay falls back to hub
    var formId  = isSet(cfg.requestFormClientHubId) ? cfg.requestFormClientHubId : "";
    var formUrl = isSet(cfg.requestFormUrl)
      ? cfg.requestFormUrl
      : (formId
          ? "https://clienthub.getjobber.com/client_hubs/" + formId +
            "/public/work_request/embedded_work_request_form"
          : "");

    // ---- Wire the Client Hub / Pay buttons -------------------------------
    document.querySelectorAll('[data-jobber="hub"]').forEach(function (el) {
      if (hubUrl) { el.href = hubUrl; }
      else { disableLink(el, "Client Hub link not configured yet"); }
    });
    document.querySelectorAll('[data-jobber="pay"]').forEach(function (el) {
      if (payUrl) { el.href = payUrl; }
      else { disableLink(el, "Payment link not configured yet"); }
    });

    // ---- Embed the request form (or show the call/email fallback) --------
    var mountWrap = document.getElementById("jobber-request-form");
    var fallback  = document.getElementById("jobber-fallback");

    if (mountWrap && formId) {
      // Jobber's snippet expects a <div id="{clienthub_id}"></div> next to its <script>.
      var mount = document.createElement("div");
      mount.id = formId;
      mountWrap.appendChild(mount);

      var s = document.createElement("script");
      s.src = cfg.embedScriptSrc ||
        "https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js";
      s.setAttribute("clienthub_id", formId);
      s.setAttribute("form_url", formUrl);
      s.async = true;
      mountWrap.appendChild(s);
    } else if (fallback) {
      // Not configured yet → hide the empty embed box, show the friendly fallback.
      if (mountWrap) { mountWrap.hidden = true; }
      fallback.hidden = false;
    }

    // ---- "Start Request" button: just scroll to the embedded form -------
    document.querySelectorAll('[data-jobber="request"]').forEach(function (el) {
      el.addEventListener("click", function (e) {
        var target = document.getElementById("request-form");
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function disableLink(el, reason) {
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("title", reason);
    el.style.opacity = "0.55";
    el.style.cursor = "not-allowed";
    el.addEventListener("click", function (e) { e.preventDefault(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
