"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserTenant } from "@/lib/auth";
import { errorState, okState, type ActionState } from "@/lib/action-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function uploadAvatar(
  file: File,
  tenantId: string,
  supabase: ReturnType<typeof createSupabaseServerClient>
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${tenantId}/avatar-${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, bytes, {
      contentType: file.type || "image/png",
      upsert: true,
    });
  if (error) throw new Error(`Avatar upload failed: ${error.message}`);
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await getCurrentUserTenant();
  if (!me) return errorState("Not signed in");

  const supabase = createSupabaseServerClient();

  let avatarUrl: string | null = null;
  try {
    const avatarFile = formData.get("avatar") as File | null;
    if (avatarFile && avatarFile.size > 0) {
      avatarUrl = await uploadAvatar(avatarFile, me.tenantId, supabase);
    }
  } catch (e) {
    return errorState(e instanceof Error ? e.message : "Avatar upload failed");
  }

  const profileUpdate: Record<string, unknown> = {
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    title: String(formData.get("title") ?? ""),
    years_experience: Number(formData.get("years_experience") ?? 0) || 0,
    specialty: String(formData.get("specialty") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    cta_url: String(formData.get("cta_url") ?? ""),
    socials: {
      facebook: String(formData.get("social_facebook") ?? "") || undefined,
      telegram: String(formData.get("social_telegram") ?? "") || undefined,
      whatsapp: String(formData.get("social_whatsapp") ?? "") || undefined,
      linkedin: String(formData.get("social_linkedin") ?? "") || undefined,
    },
  };
  if (avatarUrl) profileUpdate.avatar_url = avatarUrl;

  const { error: profileErr } = await supabase
    .from("tenant_profile")
    .update(profileUpdate)
    .eq("tenant_id", me.tenantId);
  if (profileErr) return errorState(profileErr.message);

  const { error: companyErr } = await supabase
    .from("tenant_company")
    .update({
      name: String(formData.get("company_name") ?? ""),
      full_name: String(formData.get("company_full_name") ?? ""),
      size_range: String(formData.get("company_size_range") ?? ""),
      headquarter: String(formData.get("company_headquarter") ?? ""),
      representative_offices: String(
        formData.get("company_representative_offices") ?? ""
      ),
      main_clients: String(formData.get("company_main_clients") ?? ""),
      description: String(formData.get("company_description") ?? ""),
    })
    .eq("tenant_id", me.tenantId);
  if (companyErr) return errorState(companyErr.message);

  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  return okState("Profile saved.");
}
