import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type TriggerFire = {
  widget_id?: string | null;
  code: string;
  type: string;
  why: string;
  page?: string | null;
  locale?: string | null;
};

export async function recordTriggerFire(input: TriggerFire) {
  const supa = typeof getSupabaseAdmin === "function"
    ? getSupabaseAdmin()
    : (getSupabaseAdmin as any);

  const payload: any = {
    event: "trigger_fired",
    widget_id: input.widget_id ?? null,
    page: input.page ?? null,
    meta: {
      code: input.code,
      type: input.type,
      why: input.why,
      locale: input.locale ?? null,
    },
  };

  const { error } = await supa.from("analytics").insert(payload);
  if (error) throw error;
}
