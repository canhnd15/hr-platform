"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserTenant } from "@/lib/auth";
import { errorState, okState, type ActionState } from "@/lib/action-state";
import {
  type ApplicationStage,
  DEFAULT_STAGES,
} from "@/lib/application-stages";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

function parseStages(s: string): ApplicationStage[] {
  try {
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((it: any) => ({
      key: String(it.key ?? "").trim(),
      label: String(it.label ?? "").trim(),
      color: String(it.color ?? "#94a3b8"),
      terminal: !!it.terminal,
      isReject: !!it.isReject,
    }));
  } catch {
    return [];
  }
}

export async function saveStagesAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await getCurrentUserTenant();
  if (!me) return errorState("Not signed in");

  const supabase = createSupabaseServerClient();

  const incoming = parseStages(String(formData.get("stages") ?? "[]"))
    .map((s) => ({ ...s, key: slugify(s.key) || s.key }))
    .filter((s) => s.key && s.label);

  if (incoming.length === 0) {
    return errorState("Add at least one stage.");
  }

  // Unique keys
  const keys = new Set<string>();
  for (const s of incoming) {
    if (keys.has(s.key)) return errorState(`Duplicate stage key: ${s.key}`);
    keys.add(s.key);
  }

  // At most one reject flag
  const rejectCount = incoming.filter((s) => s.isReject).length;
  if (rejectCount > 1) {
    return errorState("Only one stage can be flagged as Reject.");
  }

  // Block removal of keys that have applications attached
  const { data: usedKeysRows } = await supabase
    .from("applications")
    .select("stage")
    .eq("tenant_id", me.tenantId);
  const usedKeys = new Set<string>(
    (usedKeysRows ?? []).map((r) => r.stage as string)
  );
  const newKeys = new Set(incoming.map((s) => s.key));
  const missing: string[] = [];
  usedKeys.forEach((k) => {
    if (!newKeys.has(k)) missing.push(k);
  });
  if (missing.length > 0) {
    return errorState(
      `Cannot remove stage(s) with applications: ${missing.join(", ")}`
    );
  }

  const { error } = await supabase
    .from("tenant_ui_config")
    .update({ application_stages: incoming })
    .eq("tenant_id", me.tenantId);
  if (error) return errorState(error.message);

  revalidatePath("/admin/applications");
  revalidatePath("/admin/applications/stages");
  revalidatePath("/admin");
  return okState("Stages saved.");
}

export async function resetStagesAction(
  _prev: ActionState
): Promise<ActionState> {
  const me = await getCurrentUserTenant();
  if (!me) return errorState("Not signed in");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("tenant_ui_config")
    .update({ application_stages: DEFAULT_STAGES })
    .eq("tenant_id", me.tenantId);
  if (error) return errorState(error.message);

  revalidatePath("/admin/applications");
  revalidatePath("/admin/applications/stages");
  return okState("Stages reset to defaults.");
}
