"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserTenant } from "@/lib/auth";
import { errorState, okState, type ActionState } from "@/lib/action-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function uploadLogo(
  file: File,
  tenantId: string,
  supabase: ReturnType<typeof createSupabaseServerClient>
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${tenantId}/logo-${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("logos")
    .upload(path, bytes, {
      contentType: file.type || "image/png",
      upsert: true,
    });
  if (error) throw new Error(`Logo upload failed: ${error.message}`);
  const { data } = supabase.storage.from("logos").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveBrandingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await getCurrentUserTenant();
  if (!me) return errorState("Not signed in");

  const supabase = createSupabaseServerClient();

  let logoUrl: string | null = null;
  try {
    const file = formData.get("logo") as File | null;
    if (file && file.size > 0) {
      logoUrl = await uploadLogo(file, me.tenantId, supabase);
    }
  } catch (e) {
    return errorState(e instanceof Error ? e.message : "Logo upload failed");
  }

  const update: Record<string, unknown> = {
    primary_color: String(formData.get("primary_color") ?? "#036ae5"),
    theme_preset: String(formData.get("theme_preset") ?? "thuy"),
    font_family: String(formData.get("font_family") ?? "Be Vietnam Pro"),
  };
  if (logoUrl) update.logo_url = logoUrl;
  if (formData.get("clear_logo") === "1") update.logo_url = null;

  const { error } = await supabase
    .from("tenant_branding")
    .update(update)
    .eq("tenant_id", me.tenantId);
  if (error) return errorState(error.message);

  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  return okState("Branding saved.");
}
