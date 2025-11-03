import type { NextRequest } from "next/server";

export const dynamic = "force-static";
export const revalidate = 0;

export async function GET(_req: NextRequest) {
  // IMPORTANT: no ${...} inside this backtick string.
  const js = `(function () {
  try {
    var s = document.currentScript || (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    // ---------------- utilities ----------------
    var qs = (function () {
      try { return new URL(s.src, location.href).searchParams; }
      catch (e) { return new URLSearchParams(""); }
    })();

    function pick(key, def) {
      var camel = key.replace(/-([a-z])/g, function(_, g){ return g.toUpperCase(); });
      var fromQS = qs.get(key);
      var fromDS = s && s.dataset ? (s.dataset[camel] || s.dataset[key]) : null;
      return (fromQS != null && fromQS !== "") ? fromQS :
             (fromDS != null && fromDS !== "") ? fromDS : def;
    }

    var DEBUG = ("" + pick("debug", "0")) === "1";
    function dbg(){ if (DEBUG) { try { console.log.apply(console, ["%c[WCP]", "color:#10b981;font-weight:600"].concat([].slice.call(arguments))); } catch(e){} } }

    function el(tag, attrs, children) {
      var node = document.createElement(tag);
      if (attrs) {
        for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs,k)) {
          if (k === "style") {
            var st = attrs[k];
            for (var sk in st) if (Object.prototype.hasOwnProperty.call(st,sk)) node.style[sk] = st[sk];
          } else if (k.slice(0,2) === "on" && typeof attrs[k] === "function") {
            node.addEventListener(k.slice(2), attrs[k]);
          } else {
            node.setAttribute(k, attrs[k]);
          }
        }
      }
      if (children && children.length) {
        for (var i=0;i<children.length;i++) {
          var c = children[i];
          if (typeof c === "string") node.appendChild(document.createTextNode(c));
          else if (c) node.appendChild(c);
        }
      }
      return node;
    }

    // ---------------- config -------------------
    var cfg = {
      widget_id      : pick("id", ""),
      position       : pick("position", "right"), // left|right
      themeColor     : pick("theme-color", "#10b981"),
      icon           : pick("icon", "whatsapp"),
      ctaText        : pick("cta-text", "Chat"),
      prefillMessage : pick("prefill-message", "Hi! I'd like to know more."),
      waNumber       : pick("wa-number", ""),
      prechat        : ("" + pick("prechat", "on")).toLowerCase() === "on",
      requireName    : ("" + pick("require-name", "on")).toLowerCase() === "on",
      requireMessage : ("" + pick("require-message", "on")).toLowerCase() === "on"
    };
    dbg("cfg", cfg);
    if (!cfg.widget_id) { console.warn("[WCP] Missing widget id; bubble not rendered."); return; }

    // -------------- offline queue --------------
    var QKEY = "wcpQueue_v1";
    function readQ(){ try { return JSON.parse(localStorage.getItem(QKEY)||"[]"); } catch(e){ return []; } }
    function writeQ(a){ try { localStorage.setItem(QKEY, JSON.stringify(a)); } catch(e){} }
    function enqueue(job){ var q=readQ(); q.push(job); writeQ(q); }
    function flushQ(){
      var q = readQ(); if (!q.length) return;
      var remain = [];
      var sendOne = function (j) {
        return fetch(j.url, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(j.body) })
          .catch(function(){ remain.push(j); });
      };
      Promise.all(q.map(sendOne)).finally(function(){ writeQ(remain); });
    }
    window.addEventListener("online", flushQ);
    try { flushQ(); } catch(e){}

    function sendJSON(url, body) {
      if (!navigator.onLine) { enqueue({ url:url, body:body }); return Promise.resolve(); }
      return fetch(url, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) })
        .catch(function(){ enqueue({ url:url, body:body }); });
    }

    function postLog(evt, meta) {
      return sendJSON("/api/log", {
        widget_id: cfg.widget_id,
        page: location.href,
        event: evt,
        meta: meta || {}
      });
    }

    // ---------------- styles -------------------
    function ensureStyles() {
      if (document.getElementById("wcp-styles")) return;
      var css = ""
        + ":root{--wcp-gap:24px;--wcp-radius:12px;--wcp-shadow:0 20px 30px rgba(0,0,0,.18);}"
        + "#wcp-btn{position:fixed;bottom:calc(16px + env(safe-area-inset-bottom));right:16px;width:56px;height:56px;border-radius:999px;"
        + "border:none;box-shadow:0 10px 15px rgba(0,0,0,.15);cursor:pointer;z-index:2147483647;color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;}"
        + "#wcp-btn.left{right:auto;left:16px;}"
        + "#wcp-panel{position:fixed;bottom:calc(88px + env(safe-area-inset-bottom));right:16px;max-width:min(360px,92vw);width:clamp(280px,92vw,360px);"
        + "background:#fff;border-radius:var(--wcp-radius);box-shadow:var(--wcp-shadow);padding:16px;z-index:2147483646;display:none;"
        + "box-sizing:border-box;overflow:hidden;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif}"
        + "#wcp-panel.left{right:auto;left:16px;}"
        + "#wcp-panel h4{margin:0 0 8px 0;font-size:16px;line-height:1.25}"
        + "#wcp-panel label{display:block;margin:10px 0 6px 0;font-size:12px;color:#374151}"
        + "#wcp-panel input,#wcp-panel textarea{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box}"
        + "#wcp-panel textarea{resize:vertical;min-height:72px}"
        + "#wcp-panel .actions{display:flex;gap:8px;margin-top:12px}"
        + "#wcp-panel button{border:none;border-radius:10px;padding:10px 12px;cursor:pointer}"
        + "#wcp-panel .primary{background:__THEME__;color:#fff}"
        + "#wcp-panel .ghost{background:#f3f4f6;color:#111827}"
        + "@media (max-width:480px){#wcp-btn{width:56px;height:56px}#wcp-panel{padding:14px}}"
        + "@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto}}";
      css = css.replace(/__THEME__/g, cfg.themeColor);
      var style = el("style", { id: "wcp-styles" }, [css]);
      document.head.appendChild(style);
    }

    // ---------------- WA helpers --------------
    function waLink(message) {
      var txt = encodeURIComponent(message || cfg.prefillMessage || "");
      var base = cfg.waNumber ? ("https://wa.me/" + encodeURIComponent(cfg.waNumber)) : "https://wa.me/";
      return base + "?text=" + txt;
    }
    function openWA(message) {
      postLog("cta_click", { via: cfg.prechat ? "prechat" : "bubble" });
      try { window.open(waLink(message), "_blank", "noopener"); }
      catch(e) { location.href = waLink(message); }
    }

    // ---------------- render -------------------
    function init() {
      ensureStyles();

      var btn = el("button", {
        id: "wcp-btn",
        class: (cfg.position === "left" ? "left" : ""),
        style: { background: cfg.themeColor },
        ariaLabel: "Open WhatsApp"
      }, ["💬"]);

      var panel = el("div", { id: "wcp-panel", class: (cfg.position === "left" ? "left" : "") }, []);
      var title = el("h4", null, ["Chat with us on WhatsApp"]);
      panel.appendChild(title);

      var nameInput, msgInput;
      if (cfg.prechat) {
        panel.appendChild(el("label", null, ["Your name"]));
        nameInput = el("input", { type: "text", placeholder: "Jane" }, []);
        panel.appendChild(nameInput);
      }
      if (cfg.prechat || cfg.requireMessage) {
        panel.appendChild(el("label", null, ["Message"]));
        msgInput = el("textarea", { rows: "3", placeholder: cfg.prefillMessage }, []);
        panel.appendChild(msgInput);
      }

      var actions = el("div", { class: "actions" }, []);
      var send = el("button", { class: "primary", type: "button" }, ["Open WhatsApp"]);
      var cancel = el("button", { class: "ghost", type: "button" }, ["Close"]);
      actions.appendChild(send);
      actions.appendChild(cancel);
      panel.appendChild(actions);

      btn.addEventListener("click", function () {
        if (cfg.prechat) { panel.style.display = "block"; postLog("open"); }
        else { openWA(); }
      });

      // Also clear inputs on Close for a clean state
      cancel.addEventListener("click", function(){
        panel.style.display = "none";
        if (nameInput) nameInput.value = "";
        if (msgInput) msgInput.value = "";
        postLog("close");
      });

      send.addEventListener("click", function () {
        var nm  = (nameInput ? nameInput.value.trim() : "");
        var msg = (msgInput ? msgInput.value.trim() : "") || cfg.prefillMessage;

        if (cfg.prechat && cfg.requireName && !nm) { if (nameInput) nameInput.focus(); return; }
        if ((cfg.prechat || cfg.requireMessage) && cfg.requireMessage && !msg) { if (msgInput) msgInput.focus(); return; }

        // Finalize: clear inputs, hide panel, then open WA
        function finalizeSend() {
          if (nameInput) nameInput.value = "";
          if (msgInput)  msgInput.value  = "";
          if (panel)     panel.style.display = "none";
          openWA(msg);
        }

        if (cfg.prechat) {
          sendJSON("/api/leads", {
            widget_id: cfg.widget_id,
            name: nm || null,
            message: msg || null,
            page_url: location.href,
            meta: { source: "widget" }
          }).finally(finalizeSend);
        } else {
          finalizeSend();
        }
      });

      document.body.appendChild(btn);
      document.body.appendChild(panel);

      // first ping
      postLog("impression");
      dbg("widget rendered");
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
      init();
    }
  } catch (e) {
    try { console.error("[WCP] init error:", e); } catch(_e){}
  }
})();`;

  return new Response(js, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "x-robots-tag": "noindex",
    },
  });
}
