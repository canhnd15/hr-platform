import { AdminCard } from "@/components/admin/AdminCard";
import { CancelButton } from "@/components/admin/CancelButton";
import { SubmitButton, ToastForm } from "@/components/admin/ToastForm";
import {
  BenefitGroupsEditor,
  NavEditor,
  SectionsEditor,
} from "@/components/admin/RepeaterEditors";
import { savePagesAction } from "@/app/admin/pages/actions";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const [{ data: ui }, { data: pages }] = await Promise.all([
    supabase
      .from("tenant_ui_config")
      .select("nav_items")
      .eq("tenant_id", me.tenantId)
      .single(),
    supabase
      .from("tenant_pages")
      .select("page_key, content, visible")
      .eq("tenant_id", me.tenantId),
  ]);

  const info = pages?.find((p) => p.page_key === "information");
  const ben = pages?.find((p) => p.page_key === "benefits");

  return (
    <ToastForm action={savePagesAction} className="flex flex-col gap-6 w-full">
      <AdminCard
        title="Navigation"
        description="The links shown in the header. Path is relative to /u/<slug>. Use '/' for the home link."
      >
        <NavEditor
          name="nav_items"
          defaultValue={(ui?.nav_items ?? []) as any}
        />
      </AdminCard>

      <AdminCard
        title="Information page"
        description="Content shown at /u/<slug>/information. Section bodies support markdown."
        footer={
          <label className="flex items-center gap-2 text-sm text-dark-1 mr-auto">
            <input
              type="checkbox"
              name="information_visible"
              defaultChecked={info?.visible ?? true}
              className="w-5 h-5 accent-primary"
            />
            Page is visible
          </label>
        }
      >
        <SectionsEditor
          name="information_sections"
          defaultValue={(info?.content as any)?.sections ?? []}
        />
      </AdminCard>

      <AdminCard
        title="Benefits page"
        description="Content shown at /u/<slug>/benefits. Each group has a title and bullets (one per line, markdown OK)."
        footer={
          <label className="flex items-center gap-2 text-sm text-dark-1 mr-auto">
            <input
              type="checkbox"
              name="benefits_visible"
              defaultChecked={ben?.visible ?? true}
              className="w-5 h-5 accent-primary"
            />
            Page is visible
          </label>
        }
      >
        <BenefitGroupsEditor
          name="benefit_groups"
          defaultValue={(ben?.content as any)?.groups ?? []}
        />
      </AdminCard>

      <div className="flex justify-end gap-3">
        <CancelButton />
        <SubmitButton className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors">
          Save pages
        </SubmitButton>
      </div>
    </ToastForm>
  );
}
