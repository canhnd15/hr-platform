import { AdminCard } from "@/components/admin/AdminCard";
import { SubmitButton, ToastForm } from "@/components/admin/ToastForm";
import {
  CategoryListEditor,
  LevelListEditor,
  LocationListEditor,
} from "@/components/admin/RepeaterEditors";
import { saveFiltersAction } from "@/app/admin/filters/actions";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FiltersAdminPage() {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();
  const { data: ui } = await supabase
    .from("tenant_ui_config")
    .select("*")
    .eq("tenant_id", me.tenantId)
    .single();

  return (
    <ToastForm action={saveFiltersAction} className="flex flex-col gap-6 w-full">
      <AdminCard
        title="Filter sections"
        description="Toggle which filter groups appear on the public job list."
      >
        <div className="flex flex-col gap-3">
          {[
            { name: "show_locations", label: "Show Locations filter", def: ui?.show_locations_filter ?? true },
            { name: "show_level",     label: "Show Job Level filter", def: ui?.show_level_filter ?? true },
            { name: "show_category",  label: "Show Job Category filter", def: ui?.show_category_filter ?? true },
          ].map((t) => (
            <label key={t.name} className="flex items-center gap-3">
              <input
                type="checkbox"
                name={t.name}
                defaultChecked={t.def}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm text-dark-1">{t.label}</span>
            </label>
          ))}
        </div>
      </AdminCard>

      <AdminCard
        title="Custom locations"
        description="Add the cities/regions you recruit in. Leave empty to auto-derive from your job postings."
      >
        <LocationListEditor name="locations" defaultValue={ui?.locations ?? []} />
      </AdminCard>

      <AdminCard
        title="Job levels"
        description="Each row becomes a checkbox in the Level filter. The 'all' value is a special 'All Level' option."
      >
        <LevelListEditor name="levels" defaultValue={(ui?.levels ?? []) as any} />
      </AdminCard>

      <AdminCard
        title="Job categories"
        description="The keyword is matched (case-insensitive substring) against each job's company field."
      >
        <CategoryListEditor
          name="categories"
          defaultValue={(ui?.categories ?? []) as any}
        />
      </AdminCard>

      <div className="flex justify-end">
        <SubmitButton className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors">
          Save filters
        </SubmitButton>
      </div>
    </ToastForm>
  );
}
