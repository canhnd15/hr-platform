"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserTenant } from "@/lib/auth";
import { errorState, okState, type ActionState } from "@/lib/action-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeJsonArray<T>(s: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

async function uploadResume(
  file: File,
  tenantId: string,
  supabase: ReturnType<typeof createSupabaseServerClient>
): Promise<{ url: string; fileName: string } | null> {
  if (!file || file.size === 0) return null;
  const original = file.name || "resume.pdf";
  const ext = (original.split(".").pop() || "pdf").toLowerCase();
  if (ext !== "pdf") {
    throw new Error("CV must be a PDF file.");
  }
  const path = `${tenantId}/resume-${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from("resumes").upload(path, bytes, {
    contentType: file.type || "application/pdf",
    upsert: true,
  });
  if (error) throw new Error(`CV upload failed: ${error.message}`);
  const { data } = supabase.storage.from("resumes").getPublicUrl(path);
  return { url: data.publicUrl, fileName: original };
}

export async function saveAboutAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await getCurrentUserTenant();
  if (!me) return errorState("Not signed in");

  const supabase = createSupabaseServerClient();

  const visible = formData.get("about_visible") === "on";
  const modeRaw = String(formData.get("mode") ?? "template");
  const mode: "cv_upload" | "template" =
    modeRaw === "cv_upload" ? "cv_upload" : "template";

  // Pull existing content so we can preserve fields the user didn't touch
  const { data: existing } = await supabase
    .from("tenant_pages")
    .select("content")
    .eq("tenant_id", me.tenantId)
    .eq("page_key", "about")
    .maybeSingle();

  const prev = (existing?.content ?? {}) as Record<string, unknown>;

  let cvUrl = (prev.cvUrl as string | null) ?? null;
  let cvFileName = (prev.cvFileName as string | null) ?? null;

  try {
    const file = formData.get("cv_file") as File | null;
    if (file && file.size > 0) {
      const uploaded = await uploadResume(file, me.tenantId, supabase);
      if (uploaded) {
        cvUrl = uploaded.url;
        cvFileName = uploaded.fileName;
      }
    }
  } catch (e) {
    return errorState(e instanceof Error ? e.message : "CV upload failed");
  }

  if (formData.get("clear_cv") === "on") {
    cvUrl = null;
    cvFileName = null;
  }

  const about = String(formData.get("about") ?? "");
  const skills = safeJsonArray<string>(
    String(formData.get("skills") ?? "[]"),
    []
  ).filter((s) => s.trim().length > 0);
  const experiences = safeJsonArray<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>(String(formData.get("experiences") ?? "[]"), []).filter(
    (e) => e.title || e.company || e.description
  );
  const education = safeJsonArray<{
    school: string;
    degree: string;
    period: string;
  }>(String(formData.get("education") ?? "[]"), []).filter(
    (e) => e.school || e.degree
  );

  const content = {
    mode,
    cvUrl,
    cvFileName,
    about,
    skills,
    experiences,
    education,
  };

  const { error } = await supabase.from("tenant_pages").upsert({
    tenant_id: me.tenantId,
    page_key: "about",
    visible,
    content,
  });
  if (error) return errorState(error.message);

  revalidatePath(`/u/${me.tenantSlug}`, "layout");
  return okState("About page saved.");
}
