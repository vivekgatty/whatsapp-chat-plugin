'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Pos = 'left' | 'right';
type Icon = 'whatsapp' | 'message' | 'bolt';

type WidgetRow = {
  id: string;
  business_id: string | null;
  version: number | null;
  theme_color: string | null;
  position: Pos | null;
  icon: Icon | null;
  cta_text: string | null;
  prefill_message: string | null;
  prechat_enabled: boolean | null;
  require_name: boolean | null;
  require_message: boolean | null;
  updated_at?: string | null;
};

export default function WidgetSettingsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- tiny toast ---
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  function showOk(msg: string) { setToast({ type: 'ok', msg }); setTimeout(() => setToast(null), 2000); }
  function showErr(msg: string) { setToast({ type: 'err', msg }); setTimeout(() => setToast(null), 3000); }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [row, setRow] = useState<WidgetRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Respect ?id=... but default to known widget id
  const widgetId = useMemo(() => {
    const u = typeof window !== 'undefined' ? new URL(window.location.href) : null;
    return u?.searchParams.get('id') || '9e6dc8f7-8230-4c12-9d11-3a7b2449070e';
  }, []);

  // Derived form fields (controlled)
  const themeColor = row?.theme_color ?? '#10b981';
  const position = (row?.position ?? 'right') as Pos;
  const icon = (row?.icon ?? 'whatsapp') as Icon;
  const ctaText = row?.cta_text ?? 'Chat with us on WhatsApp';
  const prefill = row?.prefill_message ?? "Hey! Who are you?";
  const prechat = !!row?.prechat_enabled;
  const requireName = !!row?.require_name;
  const requireMessage = !!row?.require_message;
  const version = row?.version ?? null;

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);

      // 1) try to fetch the widget row
      const { data, error: wErr } = await supabase
        .from('widgets')
        .select('*')
        .eq('id', widgetId)
        .limit(1)
        .maybeSingle();

      if (!alive) return;

      if (wErr) {
        setError(wErr.message);
        setLoading(false);
        return;
      }

      if (!data) {
        // initialize local state; we will upsert on save
        setRow({
          id: widgetId,
          business_id: null,
          version: null,
          theme_color: '#10b981',
          position: 'right',
          icon: 'whatsapp',
          cta_text: 'Chat with us on WhatsApp',
          prefill_message: "Hey! Who are you?",
          prechat_enabled: false,
          require_name: false,
          require_message: false,
          updated_at: null,
        });
        setLoading(false);
        return;
      }

      // 2) ensure business_id (use most recent business if missing)
      if (!data.business_id) {
        const { data: biz } = await supabase
          .from('businesses')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (biz?.id) {
          await supabase.from('widgets').update({ business_id: biz.id }).eq('id', widgetId);
          data.business_id = biz.id;
        }
      }

      setRow(data as WidgetRow);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [supabase, widgetId]);

  async function handleSave() {
    if (!row) return;
    setSaving(true);
    setError(null);

    // Ensure business_id if possible
    let business_id = row.business_id;
    if (!business_id) {
      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      business_id = biz?.id ?? null;
    }

    const payload: WidgetRow = {
      id: row.id || widgetId,
      business_id,
      version: row.version ?? null,
      theme_color: row.theme_color ?? '#10b981',
      position: (row.position ?? 'right') as Pos,
      icon: (row.icon ?? 'whatsapp') as Icon,
      cta_text: row.cta_text ?? 'Chat with us on WhatsApp',
      prefill_message: row.prefill_message ?? "Hey! Who are you?",
      prechat_enabled: !!row.prechat_enabled,
      require_name: !!row.require_name,
      require_message: !!row.require_message,
      updated_at: new Date().toISOString(),
    };

    const { error: upErr } = await supabase.from('widgets').upsert(payload, { onConflict: 'id' });
    setSaving(false);

    if (upErr) {
      setError(upErr.message);
      showErr('Save failed.');
    } else {
      showOk('Saved!');
    }
  }

  // ----- UI -----

  if (loading) {
    return (
      <div className="p-6 max-w-xl">
        <div className="h-6 w-48 rounded bg-neutral-800 animate-pulse mb-4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded bg-neutral-900 animate-pulse mb-3" />
        ))}
      </div>
    );
  }

  if (!row) {
    return (
      <div className="p-6">
        <p className="text-red-400 mb-4">No widget rows exist yet. Create one in the <code>widgets</code> table.</p>
        <button className="rounded border px-3 py-1" onClick={() => router.push('/dashboard')}>
          ← Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Widget settings</h1>
        <button className="rounded border px-3 py-1" onClick={() => router.push('/dashboard')}>
          ← Back to dashboard
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <Field label="ID">
        <input
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          value={row.id}
          onChange={(e) => setRow((r) => (r ? { ...r, id: e.target.value } : r))}
        />
      </Field>

      <Field label="Business ID">
        <input
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          value={row.business_id ?? ''}
          onChange={(e) => setRow((r) => (r ? { ...r, business_id: e.target.value || null } : r))}
        />
      </Field>

      <Field label="Position">
        <select
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          value={position}
          onChange={(e) => setRow((r) => (r ? { ...r, position: e.target.value as Pos } : r))}
        >
          <option value="right">right</option>
          <option value="left">left</option>
        </select>
      </Field>

      <Field label="Theme color">
        <input
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          value={themeColor}
          onChange={(e) => setRow((r) => (r ? { ...r, theme_color: e.target.value } : r))}
        />
      </Field>

      <Field label="Icon">
        <select
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          value={icon}
          onChange={(e) => setRow((r) => (r ? { ...r, icon: e.target.value as Icon } : r))}
        >
          <option value="whatsapp">whatsapp</option>
          <option value="message">message</option>
          <option value="bolt">bolt</option>
        </select>
      </Field>

      <Field label="CTA text">
        <input
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          value={ctaText}
          onChange={(e) => setRow((r) => (r ? { ...r, cta_text: e.target.value } : r))}
        />
      </Field>

      <Field label="Prefill message">
        <input
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          value={prefill}
          onChange={(e) => setRow((r) => (r ? { ...r, prefill_message: e.target.value } : r))}
        />
      </Field>

      <Field label="Prechat enabled">
        <Toggle
          checked={prechat}
          onChange={(v) => setRow((r) => (r ? { ...r, prechat_enabled: v } : r))}
        />
      </Field>

      <Field label="Require name">
        <Toggle
          checked={requireName}
          onChange={(v) => setRow((r) => (r ? { ...r, require_name: v } : r))}
        />
      </Field>

      <Field label="Require message">
        <Toggle
          checked={requireMessage}
          onChange={(v) => setRow((r) => (r ? { ...r, require_message: v } : r))}
        />
      </Field>

      <Field label="Version">
        <input
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          inputMode="numeric"
          value={version ?? ''}
          onChange={(e) =>
            setRow((r) => r ? { ...r, version: e.target.value === '' ? null : Number(e.target.value) } : r)
          }
        />
      </Field>

      <div className="pt-2 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-emerald-500 px-4 py-2 font-medium text-black disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 rounded px-3 py-2 text-sm shadow-lg ${
            toast.type === 'ok'
              ? 'bg-emerald-600 text-black'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-neutral-300">{label}</div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
      <input type="checkbox" className="h-4 w-4" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {checked ? 'true' : 'false'}
    </label>
  );
}
