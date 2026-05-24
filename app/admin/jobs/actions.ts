"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserTenant } from "@/lib/auth";
import { errorState, okState, type ActionState } from "@/lib/action-state";
import { formatSalary } from "@/lib/salary";
import { slugify, uniqueJobSlug } from "@/lib/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function ownerOnly() {
  const me = await getCurrentUserTenant();
  if (!me) redirect("/login");
  return me;
}

export async function setJobStatusAction(formData: FormData) {
  const me = await ownerOnly();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "published", "archived"].includes(status)) {
    redirect("/admin/jobs");
  }
  const supabase = createSupabaseServerClient();
  await supabase
    .from("jobs")
    .update({ status })
    .eq("id", id)
    .eq("tenant_id", me.tenantId);
  revalidatePath("/admin/jobs");
  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  redirect("/admin/jobs");
}

export async function deleteJobAction(formData: FormData) {
  const me = await ownerOnly();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/jobs");
  const supabase = createSupabaseServerClient();
  await supabase
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("tenant_id", me.tenantId);
  revalidatePath("/admin/jobs");
  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  redirect("/admin/jobs");
}

export async function duplicateJobAction(formData: FormData) {
  const me = await ownerOnly();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/jobs");
  const supabase = createSupabaseServerClient();
  const { data: source } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", me.tenantId)
    .single();
  if (!source) redirect("/admin/jobs");

  const { id: _drop, created_at: _ts, ...rest } = source as any;
  const copyTitle = `${rest.title} (copy)`;
  const copySlug = await uniqueJobSlug(
    supabase as any,
    me.tenantId,
    slugify(copyTitle)
  );
  await supabase.from("jobs").insert({
    ...rest,
    title: copyTitle,
    slug: copySlug,
    status: "draft",
  });
  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}

export async function reorderJobAction(formData: FormData) {
  const me = await ownerOnly();
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "");
  if (!id || (dir !== "up" && dir !== "down")) redirect("/admin/jobs");
  const supabase = createSupabaseServerClient();

  const { data: rows } = await supabase
    .from("jobs")
    .select("id, display_order")
    .eq("tenant_id", me.tenantId)
    .order("display_order", { ascending: true });
  if (!rows) redirect("/admin/jobs");

  const idx = rows.findIndex((r) => r.id === id);
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapWith < 0 || swapWith >= rows.length) {
    redirect("/admin/jobs");
  }
  const a = rows[idx];
  const b = rows[swapWith];
  await supabase
    .from("jobs")
    .update({ display_order: b.display_order })
    .eq("id", a.id);
  await supabase
    .from("jobs")
    .update({ display_order: a.display_order })
    .eq("id", b.id);
  revalidatePath("/admin/jobs");
  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  redirect("/admin/jobs");
}

export async function saveJobAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await getCurrentUserTenant();
  if (!me) return errorState("Not signed in");

  const supabase = createSupabaseServerClient();

  const id = String(formData.get("id") ?? "");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return errorState("Title is required");

  const slugInput = slugify(String(formData.get("slug") ?? ""));
  const slugBase = slugInput || slugify(title);
  const finalSlug = await uniqueJobSlug(
    supabase as any,
    me.tenantId,
    slugBase,
    id && id !== "new" ? id : undefined
  );

  const salaryMinRaw = String(formData.get("salary_min") ?? "").trim();
  const salaryMaxRaw = String(formData.get("salary_max") ?? "").trim();
  const salaryCurrency = String(formData.get("salary_currency") ?? "USD") as
    | "USD"
    | "VND";
  const salaryOverride = String(formData.get("salary_override") ?? "").trim();

  const salaryMin = salaryMinRaw ? Number(salaryMinRaw.replace(/[^0-9.]/g, "")) : null;
  const salaryMax = salaryMaxRaw ? Number(salaryMaxRaw.replace(/[^0-9.]/g, "")) : null;
  if (salaryMin != null && Number.isNaN(salaryMin)) {
    return errorState("Salary min must be a number");
  }
  if (salaryMax != null && Number.isNaN(salaryMax)) {
    return errorState("Salary max must be a number");
  }

  const salaryDisplay =
    salaryOverride.length > 0
      ? salaryOverride
      : formatSalary(salaryMin, salaryMax, salaryCurrency, "");

  const payload: Record<string, unknown> = {
    tenant_id: me.tenantId,
    title,
    slug: finalSlug,
    level: String(formData.get("level") ?? ""),
    type: String(formData.get("type") ?? "Full-Time"),
    location_type: String(formData.get("location_type") ?? "Onsite"),
    salary: salaryDisplay,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_currency: salaryMin != null || salaryMax != null ? salaryCurrency : null,
    company: String(formData.get("company") ?? ""),
    location: String(formData.get("location") ?? ""),
    description: String(formData.get("description") ?? ""),
    requirements: String(formData.get("requirements") ?? ""),
    benefits: String(formData.get("benefits") ?? ""),
    is_hot: formData.get("is_hot") === "on",
    display_order: Number(formData.get("display_order") ?? 0) || 0,
    status: String(formData.get("status") ?? "draft"),
  };

  let savedId = id;

  if (id && id !== "new") {
    const { error } = await supabase
      .from("jobs")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", me.tenantId);
    if (error) return errorState(error.message);
  } else {
    if (!payload.display_order) {
      const { data } = await supabase
        .from("jobs")
        .select("display_order")
        .eq("tenant_id", me.tenantId)
        .order("display_order", { ascending: false })
        .limit(1);
      payload.display_order = ((data?.[0]?.display_order ?? 0) as number) + 1;
    }
    const { data, error } = await supabase
      .from("jobs")
      .insert(payload)
      .select("id")
      .single();
    if (error) return errorState(error.message);
    savedId = (data?.id as string) ?? "";
  }

  revalidatePath("/admin/jobs");
  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  return okState("Job saved.", id && id !== "new" ? undefined : `/admin/jobs/${savedId}`);
}
