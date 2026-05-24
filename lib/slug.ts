import type { SupabaseClient } from "@supabase/supabase-js";

export function slugify(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diacritics
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Returns a slug guaranteed unique within the tenant. If `base` is already
 * taken, appends "-2", "-3", … until free. Pass `excludeJobId` so updating a
 * job doesn't collide with its own existing slug.
 */
export async function uniqueJobSlug(
  supabase: SupabaseClient,
  tenantId: string,
  base: string,
  excludeJobId?: string
): Promise<string> {
  const seed = base && base.length > 0 ? base : "job";

  const { data, error } = await supabase
    .from("jobs")
    .select("id, slug")
    .eq("tenant_id", tenantId)
    .or(`slug.eq.${seed},slug.like.${seed}-%`);
  if (error) throw new Error(error.message);

  const taken = new Set(
    (data ?? [])
      .filter((r) => !excludeJobId || r.id !== excludeJobId)
      .map((r) => r.slug as string)
  );

  if (!taken.has(seed)) return seed;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${seed}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  // Extremely unlikely fallback
  return `${seed}-${Date.now()}`;
}
