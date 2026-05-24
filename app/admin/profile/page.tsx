import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AdminCard,
  Field,
  FlashBanner,
  inputCls,
  textareaCls,
} from "@/components/admin/AdminCard";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

async function saveProfile(formData: FormData) {
  "use server";
  const me = await getCurrentUserTenant();
  if (!me) redirect("/login");

  const supabase = createSupabaseServerClient();

  const avatarFile = formData.get("avatar") as File | null;
  let avatarUrl: string | null = null;
  try {
    if (avatarFile && avatarFile.size > 0) {
      avatarUrl = await uploadAvatar(avatarFile, me.tenantId, supabase);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Avatar upload failed";
    redirect(`/admin/profile?error=${encodeURIComponent(msg)}`);
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
  if (profileErr) {
    redirect(`/admin/profile?error=${encodeURIComponent(profileErr.message)}`);
  }

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
  if (companyErr) {
    redirect(`/admin/profile?error=${encodeURIComponent(companyErr.message)}`);
  }

  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  redirect(`/admin/profile?saved=1`);
}

export default async function ProfileAdminPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const [{ data: profile }, { data: company }] = await Promise.all([
    supabase
      .from("tenant_profile")
      .select("*")
      .eq("tenant_id", me.tenantId)
      .single(),
    supabase
      .from("tenant_company")
      .select("*")
      .eq("tenant_id", me.tenantId)
      .single(),
  ]);

  const socials = (profile?.socials ?? {}) as Record<string, string | undefined>;

  return (
    <form
      action={saveProfile}
      encType="multipart/form-data"
      className="flex flex-col gap-6 max-w-3xl"
    >
      <FlashBanner
        message={
          searchParams.saved
            ? "Profile saved."
            : searchParams.error || undefined
        }
        kind={searchParams.error ? "error" : "success"}
      />

      <AdminCard
        title="Personal info"
        description="Shown in the hero block of your public site."
        footer={
          <button
            type="submit"
            className="bg-primary text-white rounded-full px-5 h-10 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors"
          >
            Save all
          </button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              className={inputCls}
              required
            />
          </Field>
          <Field label="Display email">
            <input
              type="email"
              name="email"
              defaultValue={profile?.email ?? me.email ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Title">
            <input
              name="title"
              defaultValue={profile?.title ?? ""}
              className={inputCls}
              placeholder="Recruitment Specialist"
            />
          </Field>
          <Field label="Years of experience">
            <input
              type="number"
              name="years_experience"
              min={0}
              max={60}
              defaultValue={profile?.years_experience ?? 0}
              className={inputCls}
            />
          </Field>
          <Field label="Specialty" className="sm:col-span-2">
            <input
              name="specialty"
              defaultValue={profile?.specialty ?? ""}
              className={inputCls}
              placeholder="Talent Acquisition"
            />
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            <input
              name="tagline"
              defaultValue={profile?.tagline ?? ""}
              className={inputCls}
              placeholder="Connecting talents with the right opportunities"
            />
          </Field>
          <Field
            label="Avatar (PNG/JPG)"
            hint="Replaces your current avatar. Leave empty to keep the existing one."
            className="sm:col-span-2"
          >
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover border border-gray-4"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-5 grid place-items-center text-gray-2 text-xs">
                  none
                </div>
              )}
              <input
                type="file"
                name="avatar"
                accept="image/png,image/jpeg,image/webp"
                className="text-sm"
              />
            </div>
          </Field>
          <Field label="Book-call URL" className="sm:col-span-2">
            <input
              type="url"
              name="cta_url"
              defaultValue={profile?.cta_url ?? ""}
              className={inputCls}
              placeholder="https://cal.com/your-handle/15min"
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard
        title="Social links"
        description="Each link appears as a button in the hero. Leave empty to hide."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Facebook">
            <input
              type="url"
              name="social_facebook"
              defaultValue={socials.facebook ?? ""}
              className={inputCls}
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="Telegram">
            <input
              type="url"
              name="social_telegram"
              defaultValue={socials.telegram ?? ""}
              className={inputCls}
              placeholder="https://t.me/..."
            />
          </Field>
          <Field label="WhatsApp">
            <input
              type="url"
              name="social_whatsapp"
              defaultValue={socials.whatsapp ?? ""}
              className={inputCls}
              placeholder="https://wa.me/..."
            />
          </Field>
          <Field label="LinkedIn">
            <input
              type="url"
              name="social_linkedin"
              defaultValue={socials.linkedin ?? ""}
              className={inputCls}
              placeholder="https://linkedin.com/in/..."
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard
        title="Company info"
        description="Shown on the Information page and the job-detail topbar."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company name">
            <input
              name="company_name"
              defaultValue={company?.name ?? ""}
              className={inputCls}
              placeholder="Acme Co"
            />
          </Field>
          <Field label="Long name">
            <input
              name="company_full_name"
              defaultValue={company?.full_name ?? ""}
              className={inputCls}
              placeholder="Acme Co (State-of-the-Art Technology)"
            />
          </Field>
          <Field label="Size range">
            <input
              name="company_size_range"
              defaultValue={company?.size_range ?? ""}
              className={inputCls}
              placeholder="1000 - 2000"
            />
          </Field>
          <Field label="Headquarter">
            <input
              name="company_headquarter"
              defaultValue={company?.headquarter ?? ""}
              className={inputCls}
              placeholder="Hanoi, Vietnam"
            />
          </Field>
          <Field label="Representative offices" className="sm:col-span-2">
            <input
              name="company_representative_offices"
              defaultValue={company?.representative_offices ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Main clients" className="sm:col-span-2">
            <input
              name="company_main_clients"
              defaultValue={company?.main_clients ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea
              name="company_description"
              defaultValue={company?.description ?? ""}
              className={textareaCls}
              rows={3}
            />
          </Field>
        </div>
      </AdminCard>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}
