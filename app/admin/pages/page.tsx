import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminCard, FlashBanner } from "@/components/admin/AdminCard";
import {
  BenefitGroupsEditor,
  NavEditor,
  SectionsEditor,
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

async function savePages(formData: FormData) {
  "use server";
  const me = await getCurrentUserTenant();
  if (!me) redirect("/login");

  const navItems = safeJsonArray<{
    href: string;
    label: string;
    enabled: boolean;
  }>(String(formData.get("nav_items") ?? "[]"), []).filter(
    (n) => n.href && n.label
  );

  const informationSections = safeJsonArray<{
    title: string;
    body: string;
  }>(String(formData.get("information_sections") ?? "[]"), []).filter(
    (s) => s.title || s.body
  );

  const benefitGroups = safeJsonArray<{
    title: string;
    bullets: string[];
  }>(String(formData.get("benefit_groups") ?? "[]"), []).filter(
    (g) => g.title || g.bullets.length > 0
  );

  const informationVisible = formData.get("information_visible") === "on";
  const benefitsVisible = formData.get("benefits_visible") === "on";

  const supabase = createSupabaseServerClient();

  const { error: uiErr } = await supabase
    .from("tenant_ui_config")
    .update({ nav_items: navItems })
    .eq("tenant_id", me.tenantId);
  if (uiErr) {
    redirect(`/admin/pages?error=${encodeURIComponent(uiErr.message)}`);
  }

  const { error: infoErr } = await supabase
    .from("tenant_pages")
    .upsert({
      tenant_id: me.tenantId,
      page_key: "information",
      content: { sections: informationSections },
      visible: informationVisible,
    });
  if (infoErr) {
    redirect(`/admin/pages?error=${encodeURIComponent(infoErr.message)}`);
  }

  const { error: benErr } = await supabase
    .from("tenant_pages")
    .upsert({
      tenant_id: me.tenantId,
      page_key: "benefits",
      content: { groups: benefitGroups },
      visible: benefitsVisible,
    });
  if (benErr) {
    redirect(`/admin/pages?error=${encodeURIComponent(benErr.message)}`);
  }

  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  redirect("/admin/pages?saved=1");
}

export default async function PagesAdminPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
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
    <form action={savePages} className="flex flex-col gap-6 max-w-3xl">
      <FlashBanner
        message={
          searchParams.saved ? "Pages saved." : searchParams.error || undefined
        }
        kind={searchParams.error ? "error" : "success"}
      />

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
        description="Content shown at /u/<slug>/information. Add or remove sections freely."
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
        description="Content shown at /u/<slug>/benefits. Each group becomes a header + bullet list."
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

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors"
        >
          Save pages
        </button>
      </div>
    </form>
  );
}
