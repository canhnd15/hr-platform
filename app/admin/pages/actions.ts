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

export async function savePagesAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await getCurrentUserTenant();
  if (!me) return errorState("Not signed in");

  const navItems = safeJsonArray<{
    href: string;
    label: string;
    enabled: boolean;
  }>(String(formData.get("nav_items") ?? "[]"), []).filter(
    (n) => n.href && n.label
  );

  const informationSections = safeJsonArray<{
    title: string;
    body: string;
  }>(String(formData.get("information_sections") ?? "[]"), []).filter(
    (s) => s.title || s.body
  );

  const benefitGroups = safeJsonArray<{
    title: string;
    bullets: string[];
  }>(String(formData.get("benefit_groups") ?? "[]"), []).filter(
    (g) => g.title || g.bullets.length > 0
  );

  const informationVisible = formData.get("information_visible") === "on";
  const benefitsVisible = formData.get("benefits_visible") === "on";

  const supabase = createSupabaseServerClient();

  const { error: uiErr } = await supabase
    .from("tenant_ui_config")
    .update({ nav_items: navItems })
    .eq("tenant_id", me.tenantId);
  if (uiErr) return errorState(uiErr.message);

  const { error: infoErr } = await supabase.from("tenant_pages").upsert({
    tenant_id: me.tenantId,
    page_key: "information",
    content: { sections: informationSections },
    visible: informationVisible,
  });
  if (infoErr) return errorState(infoErr.message);

  const { error: benErr } = await supabase.from("tenant_pages").upsert({
    tenant_id: me.tenantId,
    page_key: "benefits",
    content: { groups: benefitGroups },
    visible: benefitsVisible,
  });
  if (benErr) return errorState(benErr.message);

  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  return okState("Pages saved.");
}
