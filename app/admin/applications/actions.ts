"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserTenant } from "@/lib/auth";
import { errorState, okState, type ActionState } from "@/lib/action-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getApplicationStagesForTenant } from "@/lib/application-stages";

async function ownerOnly() {
  const me = await getCurrentUserTenant();
  if (!me) redirect("/login");
  return me;
}

async function actorUserId(
  supabase: ReturnType<typeof createSupabaseServerClient>
): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

function bumpPaths(tenantSlug: string, applicationId: string) {
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin");
  // tenant public site doesn't render applications, no need to revalidate it
  void tenantSlug;
}

export async function updateApplicationStageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await ownerOnly();
  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!id || !stage) return errorState("Missing id or stage");

  const supabase = createSupabaseServerClient();

  const stages = await getApplicationStagesForTenant(supabase as any, me.tenantId);
  const target = stages.find((s) => s.key === stage);
  if (!target) return errorState("Unknown stage");

  // Read current to capture from_stage
  const { data: row, error: readErr } = await supabase
    .from("applications")
    .select("stage")
    .eq("id", id)
    .eq("tenant_id", me.tenantId)
    .single();
  if (readErr || !row) return errorState("Application not found");

  const from = row.stage as string;
  if (from === stage && !note) {
    return okState("No change.");
  }

  const { error: updErr } = await supabase
    .from("applications")
    .update({
      stage,
      last_stage_change_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tenant_id", me.tenantId);
  if (updErr) return errorState(updErr.message);

  await supabase.from("application_events").insert({
    tenant_id: me.tenantId,
    application_id: id,
    kind: "stage_change",
    from_stage: from,
    to_stage: stage,
    note: note || null,
    actor_user_id: await actorUserId(supabase),
  });

  bumpPaths(me.tenantSlug, id);
  return okState(`Moved to ${target.label}.`);
}

export async function updateApplicationRatingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await ownerOnly();
  const id = String(formData.get("id") ?? "");
  const rating = Math.max(0, Math.min(5, Number(formData.get("rating") ?? 0) | 0));
  if (!id) return errorState("Missing id");

  const supabase = createSupabaseServerClient();

  const { error: updErr } = await supabase
    .from("applications")
    .update({ rating })
    .eq("id", id)
    .eq("tenant_id", me.tenantId);
  if (updErr) return errorState(updErr.message);

  await supabase.from("application_events").insert({
    tenant_id: me.tenantId,
    application_id: id,
    kind: "rating",
    rating,
    actor_user_id: await actorUserId(supabase),
  });

  bumpPaths(me.tenantSlug, id);
  return okState("Rating saved.");
}

export async function addApplicationNoteAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await ownerOnly();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!id) return errorState("Missing id");
  if (!note) return errorState("Note can't be empty");

  const supabase = createSupabaseServerClient();

  // Confirm ownership
  const { data: row } = await supabase
    .from("applications")
    .select("id")
    .eq("id", id)
    .eq("tenant_id", me.tenantId)
    .single();
  if (!row) return errorState("Application not found");

  const { error } = await supabase.from("application_events").insert({
    tenant_id: me.tenantId,
    application_id: id,
    kind: "note",
    note,
    actor_user_id: await actorUserId(supabase),
  });
  if (error) return errorState(error.message);

  bumpPaths(me.tenantSlug, id);
  return okState("Note added.");
}

export async function rejectApplicationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await ownerOnly();
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!id) return errorState("Missing id");
  if (!reason) return errorState("Pick a reject reason");

  const supabase = createSupabaseServerClient();

  const stages = await getApplicationStagesForTenant(supabase as any, me.tenantId);
  const target = stages.find((s) => s.isReject);
  if (!target) return errorState("No reject stage configured");

  const { data: row, error: readErr } = await supabase
    .from("applications")
    .select("stage")
    .eq("id", id)
    .eq("tenant_id", me.tenantId)
    .single();
  if (readErr || !row) return errorState("Application not found");

  const { error: updErr } = await supabase
    .from("applications")
    .update({
      stage: target.key,
      last_stage_change_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tenant_id", me.tenantId);
  if (updErr) return errorState(updErr.message);

  await supabase.from("application_events").insert({
    tenant_id: me.tenantId,
    application_id: id,
    kind: "reject",
    from_stage: row.stage as string,
    to_stage: target.key,
    reject_reason: reason,
    note: note || null,
    actor_user_id: await actorUserId(supabase),
  });

  bumpPaths(me.tenantSlug, id);
  return okState("Application rejected.");
}
