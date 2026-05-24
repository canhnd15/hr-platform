import {
  AdminCard,
  Field,
  inputCls,
} from "@/components/admin/AdminCard";
import { SubmitButton, ToastForm } from "@/components/admin/ToastForm";
import { ThemePresetPicker } from "@/components/admin/ThemePresetPicker";
import { saveBrandingAction } from "@/app/admin/branding/actions";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const FONTS = [
  "Be Vietnam Pro",
  "Inter",
  "Manrope",
  "Plus Jakarta Sans",
  "DM Sans",
];

export default async function BrandingAdminPage() {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const { data: branding } = await supabase
    .from("tenant_branding")
    .select("*")
    .eq("tenant_id", me.tenantId)
    .single();

  return (
    <ToastForm
      action={saveBrandingAction}
      encType="multipart/form-data"
      className="flex flex-col gap-6 w-full"
    >
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
        <SubmitButton className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors">
          Save branding
        </SubmitButton>
      </div>
    </ToastForm>
  );
}
