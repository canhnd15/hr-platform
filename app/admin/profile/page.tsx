import {
  AdminCard,
  Field,
  inputCls,
  textareaCls,
} from "@/components/admin/AdminCard";
import {
  SubmitButton,
  ToastForm,
} from "@/components/admin/ToastForm";
import { saveProfileAction } from "@/app/admin/profile/actions";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfileAdminPage() {
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
    <ToastForm
      action={saveProfileAction}
      encType="multipart/form-data"
      className="flex flex-col gap-6 w-full"
    >
      <AdminCard
        title="Personal info"
        description="Shown in the hero block of your public site."
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
        <SubmitButton className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors">
          Save changes
        </SubmitButton>
      </div>
    </ToastForm>
  );
}
