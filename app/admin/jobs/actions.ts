"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserTenant } from "@/lib/auth";
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
    redirect("/admin/jobs?error=Bad+input");
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", id)
    .eq("tenant_id", me.tenantId);
  if (error) redirect(`/admin/jobs?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/jobs");
  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  redirect("/admin/jobs");
}

export async function deleteJobAction(formData: FormData) {
  const me = await ownerOnly();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/jobs");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("tenant_id", me.tenantId);
  if (error) redirect(`/admin/jobs?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/jobs");
  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  redirect("/admin/jobs");
}

export async function duplicateJobAction(formData: FormData) {
  const me = await ownerOnly();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/jobs");
  const supabase = createSupabaseServerClient();
  const { data: source, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", me.tenantId)
    .single();
  if (error || !source) redirect("/admin/jobs?error=Job+not+found");

  const { id: _drop, created_at: _ts, ...rest } = source as any;
  const { error: insErr } = await supabase.from("jobs").insert({
    ...rest,
    title: `${rest.title} (copy)`,
    status: "draft",
  });
  if (insErr) redirect(`/admin/jobs?error=${encodeURIComponent(insErr.message)}`);
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

export async function saveJobAction(formData: FormData) {
  const me = await ownerOnly();
  const supabase = createSupabaseServerClient();

  const id = String(formData.get("id") ?? "");
  const payload = {
    tenant_id: me.tenantId,
    title: String(formData.get("title") ?? "").trim(),
    level: String(formData.get("level") ?? ""),
    type: String(formData.get("type") ?? "Full-Time"),
    salary: String(formData.get("salary") ?? ""),
    company: String(formData.get("company") ?? ""),
    location: String(formData.get("location") ?? ""),
    description: String(formData.get("description") ?? ""),
    requirements: String(formData.get("requirements") ?? ""),
    benefits: String(formData.get("benefits") ?? ""),
    is_hot: formData.get("is_hot") === "on",
    display_order: Number(formData.get("display_order") ?? 0) || 0,
    status: String(formData.get("status") ?? "draft"),
  };

  if (!payload.title) {
    redirect(`/admin/jobs/${id || "new"}?error=Title+is+required`);
  }

  if (id && id !== "new") {
    const { error } = await supabase
      .from("jobs")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", me.tenantId);
    if (error) {
      redirect(`/admin/jobs/${id}?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    // Auto-place new jobs at the end if no explicit display_order.
    if (!payload.display_order) {
      const { data } = await supabase
        .from("jobs")
        .select("display_order")
        .eq("tenant_id", me.tenantId)
        .order("display_order", { ascending: false })
        .limit(1);
      payload.display_order = (data?.[0]?.display_order ?? 0) + 1;
    }
    const { error } = await supabase.from("jobs").insert(payload);
    if (error) {
      redirect(`/admin/jobs/new?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/admin/jobs");
  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  redirect("/admin/jobs?saved=1");
}
