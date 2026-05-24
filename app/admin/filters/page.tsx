import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminCard, FlashBanner } from "@/components/admin/AdminCard";
import {
  CategoryListEditor,
  LevelListEditor,
  LocationListEditor,
} from "@/components/admin/RepeaterEditors";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function safeJsonArray<T>(s: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

async function saveFilters(formData: FormData) {
  "use server";
  const me = await getCurrentUserTenant();
  if (!me) redirect("/login");

  const locations = safeJsonArray<string>(
    String(formData.get("locations") ?? "[]"),
    []
  ).filter((s) => typeof s === "string" && s.trim().length > 0);
  const levels = safeJsonArray<{ value: string; label: string }>(
    String(formData.get("levels") ?? "[]"),
    []
  ).filter((l) => l.value && l.label);
  const categories = safeJsonArray<{
    value: string;
    label: string;
    keyword: string;
  }>(String(formData.get("categories") ?? "[]"), []).filter(
    (c) => c.value && c.label && c.keyword
  );

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("tenant_ui_config")
    .update({
      show_locations_filter: formData.get("show_locations") === "on",
      show_level_filter: formData.get("show_level") === "on",
      show_category_filter: formData.get("show_category") === "on",
      locations,
      levels,
      categories,
    })
    .eq("tenant_id", me.tenantId);

  if (error) {
    redirect(`/admin/filters?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  redirect("/admin/filters?saved=1");
}

export default async function FiltersAdminPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();
  const { data: ui } = await supabase
    .from("tenant_ui_config")
    .select("*")
    .eq("tenant_id", me.tenantId)
    .single();

  return (
    <form action={saveFilters} className="flex flex-col gap-6 max-w-3xl">
      <FlashBanner
        message={
          searchParams.saved ? "Filters saved." : searchParams.error || undefined
        }
        kind={searchParams.error ? "error" : "success"}
      />

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
        <button
          type="submit"
          className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors"
        >
          Save filters
        </button>
      </div>
    </form>
  );
}
