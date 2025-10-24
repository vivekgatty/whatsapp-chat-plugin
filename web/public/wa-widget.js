/* Tiny WhatsApp widget embed
   ------------------------------------------------------------
   Usage (on any site):
   <script src="/wa-widget.js" data-widget-id="YOUR-WIDGET-ID" defer></script>

   Optional data-attributes
   - data-endpoint="/api/widget-config/"   (override API base)
   - data-hide-when-offline="true"         (hide instead of showing disabled)
*/

(function () {
  "use strict";

  // ---------- helpers ----------
  function getCurrentScript() {
    // Prefer document.currentScript. Fallback: last script tag with src ending in /wa-widget.js
    if (document.currentScript) return document.currentScript;
    const scripts = Array.from(document.getElementsByTagName("script"));
    return scripts.reverse().find((s) => (s.src || "").includes("/wa-widget.js"));
  }

  function digitsOnly(s) {
    return (s || "").replace(/\D+/g, "");
  }

  function qs(obj) {
    const out = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") out.set(k, String(v));
    });
    return out.toString();
  }

  function svgIcon(kind) {
    // Minimal inline SVGs; no external assets.
    const size = 22;
    if (kind === "bolt") {
      return (
        '<svg aria-hidden="true" width="' +
        size +
        '" height="' +
        size +
        '" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>'
      );
    }
    if (kind === "message") {
      return (
        '<svg aria-hidden="true" width="' +
        size +
        '" height="' +
        size +
        '" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6a3 3 0 0 0-3-3H6A3 3 0 0 0 3 6v9a3 3 0 0 0 3 3h9l4 4V6z"/></svg>'
      );
    }
    // default: whatsapp-style speech bubble with phone
    return (
      '<svg aria-hidden="true" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.56 2 2.1 6.23 2.1 11.5c0 1.96.6 3.78 1.62 5.29L2 22l5.41-1.64c1.44.79 3.09 1.24 4.83 1.24 5.48 0 9.94-4.23 9.94-9.5S17.52 2 12.04 2zm5.6 13.5c-.24.68-1.4 1.3-1.93 1.33-.52.04-1.15.18-3.92-1.14-3.31-1.6-5.44-5.47-5.61-5.73-.17-.26-1.35-1.8-1.35-3.44 0-1.64.86-2.44 1.18-2.78.31-.34.67-.43.89-.43.22 0 .45 0 .65.01.2.02.5-.08.78.6.28.69.95 2.37 1.04 2.54.09.17.15.37.03.6-.12.23-.18.37-.35.58-.17.2-.36.44-.51.59-.17.17-.34.36-.15.7.2.33.88 1.46 1.88 2.38 1.3 1.17 2.4 1.54 2.77 1.72.36.17.57.15.78-.09.2-.23.89-1.04 1.13-1.4.23-.37.47-.31.78-.18.31.13 1.97.93 2.31 1.1.34.17.57.26.65.41.08.15.08.86-.16 1.54z"/></svg>'
    );
  }

  function injectStyles() {
    if (document.getElementById("wa-widget-style")) return;
    const css = `
#wa-widget-root { position: fixed; bottom: 20px; z-index: 2147483000; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
#wa-widget-root.right { right: 20px; }
#wa-widget-root.left  { left: 20px; }

#wa-widget-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 9999px;
  border: none; color: #0b1220; background: #10b981;
  box-shadow: 0 8px 30px rgba(0,0,0,.25); text-decoration: none;
  font-weight: 600; cursor: pointer; transition: transform .15s ease, opacity .2s ease;
}
#wa-widget-btn:hover   { transform: translateY(-1px); }
#wa-widget-btn:active  { transform: translateY(0px) scale(.99); }

#wa-widget-btn .wa-ico { display:inline-flex; color: #0b1220; }
#wa-widget-btn .wa-cta { white-space: nowrap; }

#wa-widget-btn.wa-offline { opacity: .45; cursor: default; pointer-events: none; }

@media (max-width: 480px){
  #wa-widget-btn .wa-cta { display:none; }
}
`.trim();
    const style = document.createElement("style");
    style.id = "wa-widget-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildButton(cfg, scriptEl) {
    injectStyles();

    // Decide to hide if offline
    const hideWhenOffline = (scriptEl.getAttribute("data-hide-when-offline") || "false").toLowerCase() === "true";
    if (cfg.online === false && hideWhenOffline) return;

    // Avoid duplicates
    if (document.getElementById("wa-widget-root")) return;

    const root = document.createElement("div");
    root.id = "wa-widget-root";
    root.className = (cfg.position === "left" ? "left" : "right");

    const a = document.createElement("a");
    a.id = "wa-widget-btn";
    a.setAttribute("aria-label", cfg.ctaText || "Chat on WhatsApp");
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");

    // Apply theme/background
    const bg = cfg.themeColor || "#10b981";
    a.style.background = bg;

    // Link
    const phoneDigits = digitsOnly(cfg.waNumber);
    const prefill = cfg.prefillMessage || "";
    if (phoneDigits) {
      const query = qs({ text: prefill });
      a.href = "https://wa.me/" + phoneDigits + (query ? "?" + query : "");
    } else {
      // No number → disable
      a.href = "javascript:void(0)";
      a.classList.add("wa-offline");
      a.title = "WhatsApp number not configured";
    }

    // Icon + CTA
    const iconWrap = document.createElement("span");
    iconWrap.className = "wa-ico";
    iconWrap.innerHTML = svgIcon(cfg.icon);
    const cta = document.createElement("span");
    cta.className = "wa-cta";
    cta.textContent = cfg.ctaText || "Chat with us on WhatsApp";

    a.appendChild(iconWrap);
    a.appendChild(cta);

    // Offline visual affordance (if not hidden)
    if (cfg.online === false) {
      a.classList.add("wa-offline");
      a.title = "We’re currently offline";
    }

    root.appendChild(a);
    document.body.appendChild(root);
  }

  async function init() {
    try {
      const script = getCurrentScript();
      if (!script) return console.warn("[wa-widget] script element not found");

      const widgetId = script.getAttribute("data-widget-id");
      if (!widgetId) return console.warn("[wa-widget] Missing data-widget-id");

      const apiBase = script.getAttribute("data-endpoint") || "/api/widget-config/";
      const url = apiBase.replace(/\/+$/, "") + "/" + encodeURIComponent(widgetId);

      const res = await fetch(url, { credentials: "same-origin", cache: "no-cache" });
      if (!res.ok) {
        console.warn("[wa-widget] config fetch failed:", res.status);
        return;
      }
      const json = await res.json();
      if (!json || json.ok !== true || !json.config) {
        console.warn("[wa-widget] empty or invalid config payload");
        return;
      }

      const cfg = json.config;

      // Normalize/guard
      const normalized = {
        position: (cfg.position === "left" ? "left" : "right"),
        themeColor: cfg.themeColor || "#10b981",
        icon: cfg.icon || "whatsapp",
        ctaText: cfg.ctaText || "Chat with us on WhatsApp",
        prefillMessage: cfg.prefillMessage || "",
        waNumber: cfg.waNumber || "",
        online: cfg.online !== false, // default true if unspecified
      };

      if (!normalized.waNumber) {
        console.warn("[wa-widget] WhatsApp number missing — button will be disabled.");
      }

      // Mount
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
          buildButton(normalized, script);
        });
      } else {
        buildButton(normalized, script);
      }
    } catch (err) {
      console.warn("[wa-widget] init error:", err);
    }
  }

  init();
})();
