import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AdminCard,
  Field,
  FlashBanner,
  inputCls,
} from "@/components/admin/AdminCard";
import { ThemePresetPicker } from "@/components/admin/ThemePresetPicker";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

async function saveBranding(formData: FormData) {
  "use server";
  const me = await getCurrentUserTenant();
  if (!me) redirect("/login");

  const supabase = createSupabaseServerClient();

  let logoUrl: string | null = null;
  try {
    const file = formData.get("logo") as File | null;
    if (file && file.size > 0) {
      logoUrl = await uploadLogo(file, me.tenantId, supabase);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Logo upload failed";
    redirect(`/admin/branding?error=${encodeURIComponent(msg)}`);
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
  if (error) {
    redirect(`/admin/branding?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  redirect("/admin/branding?saved=1");
}

const FONTS = [
  "Be Vietnam Pro",
  "Inter",
  "Manrope",
  "Plus Jakarta Sans",
  "DM Sans",
];

export default async function BrandingAdminPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const { data: branding } = await supabase
    .from("tenant_branding")
    .select("*")
    .eq("tenant_id", me.tenantId)
    .single();

  return (
    <form
      action={saveBranding}
      encType="multipart/form-data"
      className="flex flex-col gap-6 max-w-3xl"
    >
      <FlashBanner
        message={
          searchParams.saved
            ? "Branding saved."
            : searchParams.error || undefined
        }
        kind={searchParams.error ? "error" : "success"}
      />

      <AdminCard
        title="Logo"
        description="Replaces the default text logo in the header. Square or wide image, max ~500px."
      >
        <div className="flex items-center gap-5">
          <div className="w-32 h-16 bg-gray-5 rounded-md border border-gray-4 grid place-items-center overflow-hidden">
            {branding?.logo_url ? (
              <img
                src={branding.logo_url}
                alt="Current logo"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-gray-2 text-xs">no logo</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="text-sm"
            />
            {branding?.logo_url && (
              <label className="text-xs text-[#d70000] inline-flex items-center gap-2">
                <input type="checkbox" name="clear_logo" value="1" />
                Remove current logo
              </label>
            )}
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Theme"
        description="Pick a Ngũ Hành preset, or choose Custom to set your own primary color."
      >
        <div className="flex flex-col gap-5">
          <ThemePresetPicker
            name="theme_preset"
            defaultValue={branding?.theme_preset ?? "thuy"}
          />
          <Field
            label="Custom primary color"
            hint="Only applies when Custom is selected above."
          >
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="primary_color"
                defaultValue={branding?.primary_color ?? "#036ae5"}
                className="h-10 w-14 cursor-pointer rounded border border-gray-3"
              />
              <span className="text-sm text-gray-1">
                Choose any HEX value
              </span>
            </div>
          </Field>
        </div>
      </AdminCard>

      <AdminCard
        title="Font"
        description="Body font used across the public site."
      >
        <Field label="Font family">
          <select
            name="font_family"
            defaultValue={branding?.font_family ?? "Be Vietnam Pro"}
            className={inputCls}
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
      </AdminCard>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors"
        >
          Save branding
        </button>
      </div>
    </form>
  );
}
