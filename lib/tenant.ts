import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoJobs, demoTenant, isSupabaseConfigured } from "@/lib/demo-tenant";
import type { Job, TenantConfig } from "@/lib/types";

type TenantRow = {
  id: string;
  slug: string;
  status: "active" | "suspended";
  tenant_branding: {
    logo_url: string | null;
    primary_color: string;
    theme_preset: TenantConfig["branding"]["themePreset"];
    font_family: string;
  } | null;
  tenant_profile: {
    full_name: string;
    email: string;
    avatar_url: string | null;
    title: string;
    years_experience: number;
    specialty: string;
    tagline: string;
    socials: TenantConfig["profile"]["socials"];
    cta_url: string;
  } | null;
  tenant_company: {
    name: string;
    full_name: string;
    size_range: string;
    headquarter: string;
    representative_offices: string;
    main_clients: string;
    description: string;
  } | null;
  tenant_ui_config: {
    show_locations_filter: boolean;
    show_level_filter: boolean;
    show_category_filter: boolean;
    locations: string[];
    levels: TenantConfig["ui"]["levels"];
    categories: TenantConfig["ui"]["categories"];
    nav_items: TenantConfig["nav"];
  } | null;
  tenant_pages:
    | {
        page_key: "information" | "benefits" | "about";
        visible: boolean;
        content: any;
      }[]
    | null;
};

export async function getTenantBySlug(
  slug: string
): Promise<TenantConfig | null> {
  // Dev fallback: when Supabase isn't configured yet, serve the demo tenant.
  if (!isSupabaseConfigured()) {
    return slug === demoTenant.slug ? demoTenant : null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select(
      `
      id, slug, status,
      tenant_branding(*),
      tenant_profile(*),
      tenant_company(*),
      tenant_ui_config(*),
      tenant_pages(page_key, visible, content)
      `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single<TenantRow>();

  if (error || !data) return null;

  const branding = data.tenant_branding;
  const profile = data.tenant_profile;
  const company = data.tenant_company;
  const ui = data.tenant_ui_config;
  const pages = data.tenant_pages ?? [];

  const infoPage = pages.find((p) => p.page_key === "information");
  const benefitsPage = pages.find((p) => p.page_key === "benefits");
  const aboutPage = pages.find((p) => p.page_key === "about");

  return {
    id: data.id,
    slug: data.slug,
    status: data.status,
    branding: {
      logoUrl: branding?.logo_url ?? null,
      primaryColor: branding?.primary_color ?? "#036ae5",
      themePreset: branding?.theme_preset ?? "thuy",
      fontFamily: branding?.font_family ?? "Be Vietnam Pro",
    },
    profile: {
      fullName: profile?.full_name ?? "",
      email: profile?.email ?? "",
      avatarUrl: profile?.avatar_url ?? null,
      title: profile?.title ?? "",
      yearsExperience: profile?.years_experience ?? 0,
      specialty: profile?.specialty ?? "",
      tagline: profile?.tagline ?? "",
      socials: profile?.socials ?? {},
      ctaUrl: profile?.cta_url ?? "",
    },
    company: {
      name: company?.name ?? "",
      fullName: company?.full_name ?? "",
      sizeRange: company?.size_range ?? "",
      headquarter: company?.headquarter ?? "",
      representativeOffices: company?.representative_offices ?? "",
      mainClients: company?.main_clients ?? "",
      description: company?.description ?? "",
    },
    nav: ui?.nav_items ?? [],
    ui: {
      showLocationsFilter: ui?.show_locations_filter ?? true,
      showLevelFilter: ui?.show_level_filter ?? true,
      showCategoryFilter: ui?.show_category_filter ?? true,
      locations: ui?.locations ?? [],
      levels: ui?.levels ?? [],
      categories: ui?.categories ?? [],
    },
    pages: {
      information: {
        visible: infoPage?.visible ?? true,
        sections: infoPage?.content?.sections ?? [],
      },
      benefits: {
        visible: benefitsPage?.visible ?? true,
        groups: benefitsPage?.content?.groups ?? [],
      },
      about: {
        visible: aboutPage?.visible ?? true,
        mode: aboutPage?.content?.mode ?? "template",
        cvUrl: aboutPage?.content?.cvUrl ?? null,
        cvFileName: aboutPage?.content?.cvFileName ?? null,
        about: aboutPage?.content?.about ?? "",
        skills: aboutPage?.content?.skills ?? [],
        experiences: aboutPage?.content?.experiences ?? [],
        education: aboutPage?.content?.education ?? [],
      },
    },
  };
}

type JobRow = {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  level: string;
  type: Job["type"];
  location_type: Job["locationType"] | null;
  salary: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: Job["salaryCurrency"];
  company: string;
  location: string;
  description: string;
  requirements: string;
  benefits: string;
  is_hot: boolean;
  display_order: number;
  status: Job["status"];
  created_at: string;
};

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    slug: row.slug ?? "",
    title: row.title,
    level: row.level,
    type: row.type,
    locationType: row.location_type ?? "Onsite",
    salary: row.salary,
    salaryMin: row.salary_min ?? null,
    salaryMax: row.salary_max ?? null,
    salaryCurrency: row.salary_currency ?? null,
    company: row.company,
    location: row.location,
    description: row.description,
    requirements: row.requirements,
    benefits: row.benefits,
    isHot: row.is_hot,
    displayOrder: row.display_order,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getJobsByTenant(
  tenantId: string,
  opts: { onlyPublished?: boolean } = { onlyPublished: true }
): Promise<Job[]> {
  if (!isSupabaseConfigured()) {
    if (tenantId !== demoTenant.id) return [];
    return opts.onlyPublished
      ? demoJobs.filter((j) => j.status === "published")
      : demoJobs;
  }
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("jobs")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("display_order", { ascending: true });
  if (opts.onlyPublished) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as JobRow[]).map(mapJob);
}

export async function getJobByIdForTenant(
  tenantId: string,
  jobId: string
): Promise<Job | null> {
  if (!isSupabaseConfigured()) {
    if (tenantId !== demoTenant.id) return null;
    return demoJobs.find((j) => j.id === jobId) ?? null;
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", jobId)
    .single();
  if (error || !data) return null;
  return mapJob(data as JobRow);
}

export async function getJobBySlugForTenant(
  tenantId: string,
  slug: string
): Promise<Job | null> {
  if (!slug) return null;
  if (!isSupabaseConfigured()) {
    if (tenantId !== demoTenant.id) return null;
    return demoJobs.find((j) => j.slug === slug) ?? null;
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return mapJob(data as JobRow);
}
