"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserTenant } from "@/lib/auth";
import { errorState, okState, type ActionState } from "@/lib/action-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeJsonArray<T>(s: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function saveFiltersAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await getCurrentUserTenant();
  if (!me) return errorState("Not signed in");

  const locations = safeJsonArray<string>(
    String(formData.get("locations") ?? "[]"),
    []
  ).filter((s) => typeof s === "string" && s.trim().length > 0);
  const levels = safeJsonArray<{ value: string; label: string }>(
    String(formData.get("levels") ?? "[]"),
    []
  ).filter((l) => l.value && l.label);
  const categories = safeJsonArray<{
    value: string;
    label: string;
    keyword: string;
  }>(String(formData.get("categories") ?? "[]"), []).filter(
    (c) => c.value && c.label && c.keyword
  );

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("tenant_ui_config")
    .update({
      show_locations_filter: formData.get("show_locations") === "on",
      show_level_filter: formData.get("show_level") === "on",
      show_category_filter: formData.get("show_category") === "on",
      locations,
      levels,
      categories,
    })
    .eq("tenant_id", me.tenantId);

  if (error) return errorState(error.message);
  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  return okState("Filters saved.");
}
