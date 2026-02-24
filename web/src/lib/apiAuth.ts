import { getSupabaseServer } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function requireApiSession() {
  const supa = await getSupabaseServer();
  const { data } = await supa.auth.getUser();
  if (!data?.user) return null;
  return data.user;
}

export async function userCanAccessBusiness(userId: string, businessId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("businesses")
    .select("id,owner_id,owner_user_id")
    .eq("id", businessId)
    .maybeSingle();
  if (!data) return false;
  return data.owner_id === userId || data.owner_user_id === userId;
}

export async function userCanAccessWidget(userId: string, widgetId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("widgets")
    .select("id,business_id,owner_user_id")
    .eq("id", widgetId)
    .maybeSingle();
  if (!data) return false;
  if (data.owner_user_id === userId) return true;
  if (!data.business_id) return false;
  return userCanAccessBusiness(userId, data.business_id);
}
