// /api/widget.js – serves a hostable, cacheable JS snippet (pure JS output)
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";      // allow query param reads
export const revalidate = 0;
export const runtime = "nodejs";

function buildWidgetJs(serverCfg: Record<string, any>): string {
  // IMPORTANT: keep the emitted code strictly JS (no TS inside the string)
  const INJECT = JSON.stringify(serverCfg || {});
  return `(()=>{try{
if(typeof window==='undefined'||typeof document==='undefined'){return;}

// Server-injected defaults (dataset/query can override)
var CFG = ${INJECT};

// Find the current <script> element to read data-* overrides
var el = document.currentScript;
if(!el){
  var scripts = document.getElementsByTagName('script');
  if(scripts && scripts.length){ el = scripts[scripts.length - 1]; }
}
var ds = (el && el.dataset) ? el.dataset : {};
var qp = {}; // query params if present on script src
try{
  var src = el && el.src ? el.src : '';
  if(src){
    var u = new URL(src, location.href);
    u.searchParams.forEach(function(v,k){ qp[k] = v; });
  }
}catch(e){}

// Normalize and choose value from dataset -> query -> CFG -> fallback
function pick(key, fallback){
  if(ds && ds[key] != null && ds[key] !== "") return ds[key];
  if(qp && qp[key] != null && qp[key] !== "") return qp[key];
  if(CFG && CFG[key] != null && CFG[key] !== "") return CFG[key];
  return fallback;
}

// Compose effective config (dataset has highest precedence)
CFG = {
  id:              pick('id', null),
  wa_number:       pick('waNumber', null),
  theme_color:     pick('themeColor', '#10b981'),
  icon:            pick('icon', 'whatsapp'),
  cta_text:        pick('ctaText', 'Chat with us on WhatsApp'),
  prefill_message: pick('prefillMessage', "Hey! I'd like to know more."),
  position:        pick('position', 'right'),
  v:               pick('v', null),
  prechat:         pick('prechat', 'off')
};

// Compute API base from script src (same-origin fallback)
var _apiBase = (function(){
  try{
    var s = el && el.src ? el.src : '';
    return new URL(s || '/', location.href).origin;
  }catch(e){ return ''; }
})();

// Send analytics (server will derive business_id from wid or use DEFAULT_BUSINESS_ID)
function sendAnalytics(event, meta){
  try{
    if(!CFG || !CFG.id){ return; }
    var payload = {
      wid: CFG.id,
      event_type: String(event || 'impression'),
      meta: Object.assign({ referrer: document.referrer || null }, meta || {})
    };
    fetch((_apiBase||'') + '/api/analytics', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }catch(e){}
}

// ---- Create bubble button ----
var btn = document.createElement('button');
btn.type = 'button';
btn.setAttribute('aria-label', (CFG.cta_text || 'Chat on WhatsApp'));

// Position left/right
var side = (CFG.position === 'left') ? 'left:24px;' : 'right:24px;';
btn.style.cssText = [
  'position:fixed',
  'z-index:2147483647',
  'bottom:24px',
  side,
  'width:56px',
  'height:56px',
  'display:inline-flex',
  'align-items:center',
  'justify-content:center',
  'border-radius:9999px',
  'border:none',
  'background:' + (CFG.theme_color || '#10b981'),
  'color:#fff',
  'box-shadow:0 8px 24px rgba(0,0,0,.18)',
  'cursor:pointer',
  'transition:transform .08s ease, filter .12s ease'
].join(';');

btn.onmouseenter = function(){ btn.style.filter='brightness(1.08)'; };
btn.onmouseleave = function(){ btn.style.filter=''; };
btn.onmousedown  = function(){ btn.style.transform='scale(.96)'; };
btn.onmouseup    = function(){ btn.style.transform=''; };

// Simple WhatsApp glyph (currentColor)
btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.5 11.5 0 0 0 2.1 16.9L1 22.5l5.72-1.5A11.5 11.5 0 0 0 20.52 3.48Zm-8.9 15.87a9.5 9.5 0 1 1 7.18-2.8 9.47 9.47 0 0 1-7.18 2.8Zm5.01-6.73c-.27-.13-1.58-.78-1.82-.86s-.42-.13-.6.13-.69.86-.84 1.04-.31.2-.57.07a7.75 7.75 0 0 1-2.24-1.38 8.4 8.4 0 0 1-1.56-1.93c-.16-.27 0-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.45-.82-1.99-.22-.53-.44-.46-.6-.46h-.51c-.16 0-.41.06-.62.31s-.81.79-.81 1.93c0 1.14.83 2.24.95 2.39a9.54 9.54 0 0 0 3.5 3.3c.49.27.87.43 1.17.55.49.18.94.16 1.29.1.39-.06 1.2-.49 1.37-.96.17-.47.17-.87.12-.96-.05-.09-.22-.15-.49-.28Z"/></svg>';

// Click → record "open" and then open WhatsApp
btn.onclick = function(){
  try{
    sendAnalytics('open', {});
    var num = (CFG.wa_number || '').replace(/[^0-9]/g,'');
    var msg = encodeURIComponent(CFG.prefill_message || '');
    var url = 'https://api.whatsapp.com/send?phone=' + num + (msg ? '&text=' + msg : '');
    window.open(url, '_blank', 'noopener');
  }catch(e){}
};

// Mount + initial view analytics
document.body.appendChild(btn);
sendAnalytics('impression', { position: CFG.position, v: CFG.v, prechat: CFG.prechat });

}catch(e){/* swallow */}})();`;
}

export async function GET(req: Request) {
  // Read query only to pre-inject id/prechat if provided; data-* can still override.
  let serverCfg: Record<string, any> = {};
  try {
    const u = new URL(req.url);
    const id = u.searchParams.get("id");
    const prechat = u.searchParams.get("prechat");
    if (id) serverCfg.id = id;
    if (prechat) serverCfg.prechat = prechat;
  } catch (_) {}

  const js = buildWidgetJs(serverCfg);
  return new NextResponse(js, {
    status: 200,
    headers: {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400",
      "x-robots-tag": "noindex"
    },
  });
}
