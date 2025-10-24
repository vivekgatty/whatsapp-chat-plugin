// /api/widget.js – serves a hostable, cacheable JS snippet (pure JS output)
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function buildWidgetJs(serverCfg: Record<string, any>): string {
  const INJECT = JSON.stringify(serverCfg || {});
  return `(()=>{try{
if(typeof window==='undefined'||typeof document==='undefined'){return;}

var CFG = ${INJECT};

var el = document.currentScript;
if(!el){
  var scripts = document.getElementsByTagName('script');
  if(scripts && scripts.length){ el = scripts[scripts.length - 1]; }
}
var ds = (el && el.dataset) ? el.dataset : {};
var qp = {};
try{
  var src = el && el.src ? el.src : '';
  if(src){
    var u = new URL(src, location.href);
    u.searchParams.forEach(function(v,k){ qp[k] = v; });
  }
}catch(e){}

// helper to know if a key was set via data-* or query (these take precedence)
function hasDsOrQp(key){
  return (ds && ds[key] != null && ds[key] !== "") || (qp && qp[key] != null && qp[key] !== "");
}

function pick(key, fallback){
  if(ds && ds[key] != null && ds[key] !== "") return ds[key];
  if(qp && qp[key] != null && qp[key] !== "") return qp[key];
  if(CFG && CFG[key] != null && CFG[key] !== "") return CFG[key];
  return fallback;
}

// Initial config from data/query/server (remote config merges later)
CFG = {
  id:              pick('id', null),
  wa_number:       pick('waNumber', null),
  theme_color:     pick('themeColor', '#10b981'),
  icon:            pick('icon', 'whatsapp'),
  cta_text:        pick('ctaText', 'Chat with us on WhatsApp'),
  prefill_message: pick('prefillMessage', "Hey! I'd like to know more."),
  position:        pick('position', 'right'),
  v:               pick('v', null),
  prechat:         pick('prechat', 'off'),
  require_name:    String(pick('requireName','on')).toLowerCase()==='on',
  require_message: String(pick('requireMessage','off')).toLowerCase()==='on'
};

// map camelCase -> our internal snake_case keys
function applyRemote(remote){
  try{
    if(!remote) return;
    // only apply if NOT overridden by data-* or query
    if(!hasDsOrQp('waNumber')       && remote.waNumber       != null) CFG.wa_number       = remote.waNumber;
    if(!hasDsOrQp('themeColor')     && remote.themeColor     != null) CFG.theme_color     = remote.themeColor;
    if(!hasDsOrQp('icon')           && remote.icon           != null) CFG.icon            = remote.icon;
    if(!hasDsOrQp('ctaText')        && remote.ctaText        != null) CFG.cta_text        = remote.ctaText;
    if(!hasDsOrQp('prefillMessage') && remote.prefillMessage != null) CFG.prefill_message = remote.prefillMessage;
    if(!hasDsOrQp('position')       && remote.position       != null) CFG.position        = remote.position;
    if(!hasDsOrQp('prechat')        && remote.prechat        != null) CFG.prechat         = remote.prechat;
    if(!hasDsOrQp('requireName')    && remote.requireName    != null) CFG.require_name    = !!remote.requireName;
    if(!hasDsOrQp('requireMessage') && remote.requireMessage != null) CFG.require_message = !!remote.requireMessage;
    if(!hasDsOrQp('v')              && remote.v              != null) CFG.v               = remote.v;
  }catch(e){}
}

var _apiBase = (function(){
  try{
    var s = el && el.src ? el.src : '';
    return new URL(s || '/', location.href).origin;
  }catch(e){ return ''; }
})();

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

// ---- UI bootstrap (runs after remote config merge) ----
function initUI(){
  // === bubble ===
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', (CFG.cta_text || 'Chat on WhatsApp'));

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

  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.5 11.5 0 0 0 2.1 16.9L1 22.5l5.72-1.5A11.5 11.5 0 0 0 20.52 3.48Zm-8.9 15.87a9.5 9.5 0 1 1 7.18-2.8 9.47 9.47 0 0 1-7.18 2.8Zm5.01-6.73c-.27-.13-1.58-.78-1.82-.86s-.42-.13-.6.13-.69.86-.84 1.04-.31.2-.57.07a7.75 7.75 0 0 1-2.24-1.38 8.4 8.4 0 0 1-1.56-1.93c-.16-.27 0-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.45-.82-1.99-.22-.53-.44-.46-.6-.46h-.51c-.16 0-.41.06-.62.31s-.81.79-.81 1.93c0 1.14.83 2.24.95 2.39a9.54 9.54 0 0 0 3.5 3.3c.49.27.87.43 1.17.55.49.18.94.16 1.29.1.39-.06 1.2-.49 1.37-.96.17-.47.17-.87.12-.96-.05-.09-.22-.15-.49-.28Z"/></svg>';

  // === prechat panel (if enabled) ===
  var panel = null, nameInput = null, msgInput = null, submitBtn = null;
  if(String(CFG.prechat).toLowerCase()==='on'){
    panel = document.createElement('div');
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-label','Chat form');
    panel.style.cssText = [
      'position:fixed',
      'z-index:2147483647',
      'bottom:92px',
      (CFG.position==='left' ? 'left:24px;' : 'right:24px;'),
      'width:320px',
      'background:#0b1220',
      'color:#e5ecf5',
      'border-radius:16px',
      'box-shadow:0 16px 48px rgba(0,0,0,.25)',
      'padding:16px',
      'display:none'
    ].join(';');

    nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Your name';
    nameInput.setAttribute('data-wcp-name','');
    nameInput.style.cssText = [
      'width:100%','box-sizing:border-box','margin:0 0 10px 0',
      'padding:10px 12px','border-radius:10px','border:1px solid #21304a',
      'background:#0f172a','color:#e5ecf5','outline:none'
    ].join(';');
    panel.appendChild(nameInput);

    msgInput = document.createElement('textarea');
    msgInput.placeholder = "Hi! I'd like to know more.";
    msgInput.setAttribute('data-wcp-message','');
    msgInput.rows = 4;
    msgInput.style.cssText = [
      'width:100%','box-sizing:border-box','margin:0 0 12px 0',
      'padding:10px 12px','border-radius:10px','border:1px solid #21304a',
      'background:#0f172a','color:#e5ecf5','outline:none','resize:vertical'
    ].join(';');
    panel.appendChild(msgInput);

    submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.textContent = 'Open WhatsApp';
    submitBtn.style.cssText = [
      'display:inline-flex','align-items:center','justify-content:center',
      'height:40px','padding:0 14px','border:none','border-radius:10px',
      'background:' + (CFG.theme_color || '#10b981'),'color:#fff',
      'cursor:pointer'
    ].join(';');
    panel.appendChild(submitBtn);
    document.body.appendChild(panel);
  }

  function readNameMessage(){
    var name = '';
    var msg  = '';
    try{
      if(nameInput && typeof nameInput.value==='string' && nameInput.value.trim()){
        name = nameInput.value.trim();
      }else{
        var ns = ['input[data-wcp-name]','input[name="wcp_name"]','input[placeholder="Your name"]','input[aria-label="Your name"]'];
        for(var i=0;i<ns.length;i++){ var n=document.querySelector(ns[i]); if(n && n.value && n.value.trim()){ name=n.value.trim(); break; } }
      }
      if(msgInput && typeof msgInput.value==='string' && msgInput.value.trim()){
        msg = msgInput.value;
      }else{
        var ms = ['textarea[data-wcp-message]','textarea[name="wcp_message"]','textarea[placeholder]','textarea'];
        for(var j=0;j<ms.length;j++){ var t=document.querySelector(ms[j]); if(t && t.value && t.value.trim()){ msg=t.value; break; } }
      }
    }catch(e){}
    if(!msg){ msg = CFG.prefill_message || ''; }
    return { name:name, message:msg };
  }

  function sendLead(){
    try{
      if(!CFG || !CFG.id){ return; }
      var vals = readNameMessage();
      fetch((_apiBase||'') + '/api/track-lead?wid=' + encodeURIComponent(CFG.id), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: vals.name || '', message: vals.message || '', source: 'widget' })
      });
    }catch(e){}
  }

  function openWhatsApp(){
    var num = (CFG.wa_number || '').replace(/[^0-9]/g,'');
    var msg = encodeURIComponent((readNameMessage().message) || '');
    var url = 'https://api.whatsapp.com/send?' + (num ? ('phone=' + num + '&') : '') + (msg ? ('text=' + msg) : '');
    window.open(url, '_blank', 'noopener');
  }

  // Bubble click
  btn.onclick = function(){
    try{
      sendAnalytics('open', {});
      if(String(CFG.prechat).toLowerCase()==='on' && panel){
        panel.style.display = (panel.style.display==='none' || !panel.style.display) ? 'block' : 'none';
        if(panel.style.display==='block' && msgInput && !msgInput.value){ msgInput.value = CFG.prefill_message || ''; }
      }else{
        sendLead();
        openWhatsApp();
      }
    }catch(e){}
  };

  // Prechat submit (if present)
  if(submitBtn){
    submitBtn.onclick = function(){
      var vals = readNameMessage();
      if(CFG.require_name && !vals.name){ if(nameInput && nameInput.focus) nameInput.focus(); return; }
      if(CFG.require_message && !vals.message){ if(msgInput && msgInput.focus) msgInput.focus(); return; }
      sendLead();
      openWhatsApp();
    };
  }

  document.body.appendChild(btn);
  sendAnalytics('impression', { position: CFG.position, v: CFG.v, prechat: CFG.prechat });
}

// Fetch remote config (non-blocking fail-safe), then init UI
(function(){
  try{
    if(!CFG || !CFG.id){ initUI(); return; }
    var url = ((_apiBase||'')) + '/api/widget-config/' + encodeURIComponent(CFG.id);
    if(CFG.v != null){ url += '?v=' + encodeURIComponent(CFG.v); }
    fetch(url, { method:'GET' })
      .then(function(r){ return r.json().catch(function(){ return {}; }); })
      .then(function(j){
        if(j && j.ok && j.config){ applyRemote(j.config); }
      })
      .catch(function(){})
      .finally(function(){ initUI(); });
  }catch(e){ initUI(); }
})();
}catch(e){/* swallow */}})();`;
}

export async function GET(req: Request) {
  let serverCfg: Record<string, any> = {};
  try {
    const u = new URL(req.url);
    const id = u.searchParams.get("id");
    const prechat = u.searchParams.get("prechat");
    const waNumber = u.searchParams.get("waNumber");
    if (id) serverCfg.id = id;
    if (prechat) serverCfg.prechat = prechat;
    if (waNumber) serverCfg.waNumber = waNumber;
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
