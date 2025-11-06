export const dynamic = "force-dynamic";
export const revalidate = 0;

// Defensive import (works whether the module uses named or namespace export)
import * as CT from "../../../../lib/customTriggers";

// Server-side fallback list if module export is missing/empty
const FALLBACK_TYPES = ["manual", "url_param", "utm", "path_match"] as const;
const allowedTypes =
  (CT as any)?.ALLOWED_TRIGGER_TYPES && (CT as any).ALLOWED_TRIGGER_TYPES.length
    ? (CT as any).ALLOWED_TRIGGER_TYPES
    : FALLBACK_TYPES;

export default function Page() {
  // Embed the list for the client script (stringified safely)
  const allowed = JSON.stringify(allowedTypes);

  const sampleByType = JSON.stringify({
    manual:     { via: "intent_param_or_widget_setting" },
    url_param:  { key: "intent", value: "offers" },
    utm:        { campaign: "diwali2025", source: "google" },
    path_match: { regex: "^/product/.+" },
  });

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Custom Triggers</h1>
        <div className="text-sm opacity-70">Attach rules to auto-reply templates</div>
      </div>

      {/* Upgrade banner placeholder */}
      <div id="upgradeBanner" className="hidden rounded border border-amber-400/50 bg-amber-500/10 text-amber-200 p-3">
        <b>Pro required:</b> Custom triggers need an active ₹199/month subscription.
        <a className="underline ms-2" href="/dashboard/billing">Upgrade now</a>
      </div>

      {/* Create form */}
      <div className="rounded border border-slate-800 bg-slate-900/40 p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Code (unique)</label>
            <input id="ct_code" className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1" placeholder="e.g., diwali_sale" />
            <div className="text-xs opacity-60 mt-1">3–30 chars: a-z, 0-9, _</div>
          </div>
          <div>
            <label className="block text-sm mb-1">Label</label>
            <input id="ct_label" className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1" placeholder="Diwali Sale campaign" />
          </div>
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select id="ct_type" className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1"></select>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Matchers (JSON)</label>
          <textarea id="ct_matchers" className="w-full min-h-[110px] bg-slate-950 border border-slate-700 rounded px-2 py-1" placeholder='{ "key": "intent", "value": "offers" }'></textarea>
          <div className="text-xs opacity-60 mt-1">Example changes with type.</div>
        </div>

        <div className="flex items-center gap-2">
          <input id="ct_active" type="checkbox" defaultChecked className="accent-emerald-500" />
          <label htmlFor="ct_active">Active</label>
          <button id="ct_create" className="ms-auto px-3 py-1 rounded bg-emerald-500 text-black border border-emerald-400 hover:bg-emerald-400">
            Create Trigger
          </button>
        </div>

        <div id="ct_error" className="hidden text-red-400 text-sm"></div>
        <div id="ct_success" className="hidden text-emerald-400 text-sm"></div>
      </div>

      {/* List */}
      <div className="rounded border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Label</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Active</th>
              <th className="text-left p-2">Matchers</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody id="ct_body">
            <tr><td colSpan={6} className="p-3 opacity-70">Loading...</td></tr>
          </tbody>
        </table>
      </div>

      {/* JSON blobs for the client script */}
      <script id="ct_allowed" type="application/json" dangerouslySetInnerHTML={{ __html: allowed }} />
      <script id="ct_samples" type="application/json" dangerouslySetInnerHTML={{ __html: sampleByType }} />

      {/* Client-side script with robust fallbacks */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  const $ = (sel) => document.querySelector(sel);
  const body = $('#ct_body');
  const banner = $('#upgradeBanner');
  const errBox = $('#ct_error');
  const okBox = $('#ct_success');

  function parseBlob(id, fallback){
    try {
      const el = document.getElementById(id);
      const txt = (el && el.textContent) ? el.textContent : '';
      return txt ? JSON.parse(txt) : fallback;
    } catch(e){ return fallback; }
  }

  const allowed = parseBlob('ct_allowed', ["manual","url_param","utm","path_match"]);
  const samples = parseBlob('ct_samples', {
    manual:{}, url_param:{ key:"intent", value:"offers" }, utm:{ campaign:"" }, path_match:{ regex:"^/product/.+" }
  });

  const typeSelect = $('#ct_type');
  function renderTypeOptions(){
    typeSelect.innerHTML = (allowed || []).map(t => '<option value="'+t+'">'+t+'</option>').join('');
  }
  function setSampleFor(type){
    const area = $('#ct_matchers');
    const sample = samples[type] || {};
    try { area.value = JSON.stringify(sample, null, 2); } catch(_) {}
  }

  function flash(el, msg, isError){
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('hidden', !msg);
    if (isError) { okBox.classList.add('hidden'); } else { errBox.classList.add('hidden'); }
  }

  async function loadList(){
    body.innerHTML = '<tr><td colspan="6" class="p-3 opacity-70">Loading...</td></tr>';
    try{
      const r = await fetch('/api/triggers?active=0',{ cache:'no-store' });
      const j = await r.json();

      if (j && j.can_write === false) {
        banner.classList.remove('hidden');
        $('#ct_create').setAttribute('disabled','true');
      } else {
        banner.classList.add('hidden');
        $('#ct_create').removeAttribute('disabled');
      }

      const items = Array.isArray(j.items) ? j.items : [];
      if (!items.length){
        body.innerHTML = '<tr><td colspan="6" class="p-3 opacity-70">No custom triggers yet.</td></tr>';
        return;
      }

      body.innerHTML = items.map(it => {
        const matchers = JSON.stringify(it.matchers || {}, null, 2);
        const select = (allowed || []).map(t => '<option value="'+t+'" '+(t===it.type?'selected':'')+'>'+t+'</option>').join('');
        return \`
          <tr data-id="\${it.id}" class="border-t border-slate-800 align-top">
            <td class="p-2 text-xs font-mono">\${it.code}</td>
            <td class="p-2"><input class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1" value="\${it.label || ''}" data-k="label"/></td>
            <td class="p-2">
              <select class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1" data-k="type">\${select}</select>
            </td>
            <td class="p-2"><input type="checkbox" \${it.active?'checked':''} data-k="active"/></td>
            <td class="p-2 w-[45%]">
              <textarea class="w-full min-h-[90px] bg-slate-950 border border-slate-700 rounded px-2 py-1" data-k="matchers">\${matchers}</textarea>
            </td>
            <td class="p-2">
              <div class="flex gap-2">
                <button class="px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700" data-act="save">Save</button>
                <button class="px-3 py-1 rounded bg-red-500/80 text-black border border-red-400 hover:bg-red-400" data-act="del">Delete</button>
              </div>
            </td>
          </tr>\`;
      }).join('');
    }catch(e){
      body.innerHTML = '<tr><td colspan="6" class="p-3 text-red-400">Failed to load triggers.</td></tr>';
    }
  }

  async function createTrigger(){
    const code = $('#ct_code').value.trim();
    const label = $('#ct_label').value.trim();
    const type = $('#ct_type').value;
    let matchers = {};
    try { matchers = JSON.parse($('#ct_matchers').value || '{}'); } catch(e){ flash(errBox, 'Matchers must be valid JSON.', true); return; }
    const active = $('#ct_active').checked;

    flash(errBox, ''); flash(okBox, '');
    const r = await fetch('/api/triggers', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ code, label, type, matchers, active })
    });
    const j = await r.json();
    if (!r.ok) { flash(errBox, j?.error || 'Create failed', true); return; }
    flash(okBox, 'Created'); 
    $('#ct_code').value = ''; $('#ct_label').value='';
    setSampleFor(type);
    await loadList();
  }

  function rowPatch(tr){
    const patch = {};
    tr.querySelectorAll('[data-k]').forEach((el)=>{
      const k = el.getAttribute('data-k');
      if (k==='active') patch[k] = el.checked;
      else if (k==='matchers') {
        try { patch[k] = JSON.parse(el.value || '{}'); } catch(e){ patch['__matchers_error'] = 'invalid'; }
      } else if (k && 'value' in el) {
        patch[k] = el.value;
      }
    });
    return patch;
  }

  async function saveRow(tr){
    const id = tr.getAttribute('data-id');
    const patch = rowPatch(tr);
    if (patch['__matchers_error']) { flash(errBox, 'Matchers must be valid JSON.', true); return; }
    flash(errBox, ''); flash(okBox, '');
    const r = await fetch('/api/triggers/'+id, {
      method:'PUT',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(patch)
    });
    const j = await r.json();
    if (!r.ok) { flash(errBox, j?.error || 'Update failed', true); return; }
    flash(okBox, 'Saved'); 
    await loadList();
  }

  async function deleteRow(tr){
    const id = tr.getAttribute('data-id');
    if (!confirm('Delete this trigger?')) return;
    flash(errBox, ''); flash(okBox, '');
    const r = await fetch('/api/triggers/'+id, { method:'DELETE' });
    const j = await r.json();
    if (!r.ok) { flash(errBox, j?.error || 'Delete failed', true); return; }
    flash(okBox, 'Deleted');
    await loadList();
  }

  // Wire up and init
  renderTypeOptions();
  setSampleFor($('#ct_type').value || (allowed && allowed[0]) || 'manual');
  $('#ct_create').addEventListener('click', (e)=>{ e.preventDefault(); createTrigger(); });
  body.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    const act = btn.getAttribute('data-act');
    if (act==='save') saveRow(tr);
    else if (act==='del') deleteRow(tr);
  });

  loadList();
})();
          `,
        }}
      />
    </div>
  );
}