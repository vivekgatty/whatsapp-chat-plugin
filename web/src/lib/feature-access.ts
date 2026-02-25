import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireApiSession, userCanAccessBusiness } from "@/lib/apiAuth";
import { FeatureKey, hasFeature, normalizePlan } from "@/lib/feature-flags";
import { sanitizeText } from "@/lib/utils/sanitize";

export type FeatureAccess =
  | { ok: true; userId: string; workspaceId: string; plan: string }
  | { ok: false; status: number; error: string };

export async function requireFeatureAccess(req: NextRequest, feature: FeatureKey): Promise<FeatureAccess> {
  const user = await requireApiSession();
  if (!user) return { ok: false, status: 401, error: "unauthorized" };

  const sp = req.nextUrl.searchParams;
  const workspaceId =
    sanitizeText(sp.get("workspace_id"), 60) ||
    sanitizeText(sp.get("business_id"), 60) ||
    sanitizeText(req.headers.get("x-workspace-id"), 60) ||
    "";

  if (!workspaceId) {
    return { ok: false, status: 400, error: "workspace_id required" };
  }

  if (!(await userCanAccessBusiness(user.id, workspaceId))) {
    return { ok: false, status: 403, error: "forbidden" };
  }

  const { data } = await getSupabaseAdmin()
    .from("businesses")
    .select("plan")
    .eq("id", workspaceId)
    .maybeSingle();

  const plan = normalizePlan(String(data?.plan || "starter"));
  if (!hasFeature(plan, feature)) {
    return {
      ok: false,
      status: 403,
      error: `Feature ${feature} requires upgrade. Current plan: ${plan}.`,
    };
  }

  return { ok: true, userId: user.id, workspaceId, plan };
}
