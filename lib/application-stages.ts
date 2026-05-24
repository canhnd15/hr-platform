import type { SupabaseClient } from "@supabase/supabase-js";

export type ApplicationStage = {
  key: string;
  label: string;
  color: string;
  terminal: boolean;
  isReject?: boolean;
};

export const DEFAULT_STAGES: ApplicationStage[] = [
  { key: "new", label: "New", color: "#0ea5e9", terminal: false },
  { key: "interview", label: "Interview", color: "#a855f7", terminal: false },
  { key: "offer", label: "Offer", color: "#f59e0b", terminal: false },
  { key: "hired", label: "Hired", color: "#22c55e", terminal: true },
  {
    key: "rejected",
    label: "Rejected",
    color: "#ef4444",
    terminal: true,
    isReject: true,
  },
];

export const REJECT_REASONS: { key: string; label: string }[] = [
  { key: "not_a_fit", label: "Not a fit" },
  { key: "no_response", label: "No response" },
  { key: "better_candidate", label: "Better candidate" },
  { key: "other", label: "Other" },
];

export function stagesById(
  stages: ApplicationStage[]
): Record<string, ApplicationStage> {
  return Object.fromEntries(stages.map((s) => [s.key, s]));
}

export function resolveStage(
  stages: ApplicationStage[],
  key: string | null | undefined
): ApplicationStage {
  if (!key) return stages[0] ?? DEFAULT_STAGES[0];
  return stages.find((s) => s.key === key) ?? stages[0] ?? DEFAULT_STAGES[0];
}

export function rejectStage(
  stages: ApplicationStage[]
): ApplicationStage | undefined {
  return stages.find((s) => s.isReject);
}

export async function getApplicationStagesForTenant(
  supabase: SupabaseClient,
  tenantId: string
): Promise<ApplicationStage[]> {
  const { data } = await supabase
    .from("tenant_ui_config")
    .select("application_stages")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  const raw = (data?.application_stages ?? []) as unknown;
  if (Array.isArray(raw) && raw.length > 0) return raw as ApplicationStage[];
  return DEFAULT_STAGES;
}
