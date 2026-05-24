import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
  tenantId: string;
  tenantSlug: string;
};

/**
 * Resolve the signed-in user and their tenant. Returns null when not signed in
 * or when the user has no tenant row yet (e.g. signup mid-flight).
 */
export async function getCurrentUserTenant(): Promise<CurrentUser | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, slug")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!tenant) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
  };
}
