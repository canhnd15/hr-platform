import Link from "next/link";
import { RatingInput } from "@/components/admin/RatingInput";
import { StageSelect } from "@/components/admin/StageSelect";
import { StageBadge } from "@/components/admin/StageBadge";
import {
  getApplicationStagesForTenant,
  resolveStage,
} from "@/lib/application-stages";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { stage?: string; q?: string; job?: string };
}) {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const stages = await getApplicationStagesForTenant(
    supabase as any,
    me.tenantId
  );

  // Counts per stage (head: true is fast — no row data fetched)
  const stageCounts: Record<string, number> = {};
  await Promise.all(
    stages.map(async (s) => {
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", me.tenantId)
        .eq("stage", s.key);
      stageCounts[s.key] = count ?? 0;
    })
  );
  const total = Object.values(stageCounts).reduce((a, b) => a + b, 0);

  // Job filter dropdown options
  const { data: jobOpts } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("tenant_id", me.tenantId)
    .order("display_order", { ascending: true });

  // Main query
  const activeStage = searchParams.stage ?? "";
  const activeJob = searchParams.job ?? "";
  const q = (searchParams.q ?? "").trim();

  let query = supabase
    .from("applications")
    .select(
      "id, form_type, name, phone, email, candidate_name, candidate_phone, candidate_email, cv_url, stage, rating, last_stage_change_at, created_at, jobs(id, title)"
    )
    .eq("tenant_id", me.tenantId)
    .order("last_stage_change_at", { ascending: false });

  if (activeStage) query = query.eq("stage", activeStage);
  if (activeJob) query = query.eq("job_id", activeJob);
  if (q) {
    const esc = q.replace(/[%_]/g, "\\$&");
    query = query.or(
      `name.ilike.%${esc}%,email.ilike.%${esc}%,candidate_name.ilike.%${esc}%,candidate_email.ilike.%${esc}%`
    );
  }

  const { data: apps } = await query;

  // CV signed URLs
  const cvUrls: Record<string, string> = {};
  if (apps) {
    await Promise.all(
      apps
        .filter((a) => a.cv_url)
        .map(async (a) => {
          const { data } = await supabase.storage
            .from("cvs")
            .createSignedUrl(a.cv_url!, 3600);
          if (data?.signedUrl) cvUrls[a.id] = data.signedUrl;
        })
    );
  }

  const baseChip =
    "inline-flex items-center gap-2 px-3 h-8 rounded-full text-sm border transition-colors";
  const chipInactive = "bg-white border-gray-3 text-dark-1 hover:bg-gray-5";
  const chipActive = "border-primary text-primary bg-primary-tint";

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      stage: activeStage || undefined,
      job: activeJob || undefined,
      q: q || undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `?${qs}` : "/admin/applications";
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-dark-1">Applications</h2>
          <p className="text-sm text-gray-1 mt-1">
            {total} total · track candidates from first apply through hire.
          </p>
        </div>
        <Link
          href="/admin/applications/stages"
          className="text-sm text-primary font-semibold hover:underline"
        >
          Manage stages →
        </Link>
      </div>

      {/* Stage chips */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref({ stage: undefined })}
          className={`${baseChip} ${!activeStage ? chipActive : chipInactive}`}
        >
          All
          <span className="text-xs opacity-70">{total}</span>
        </Link>
        {stages.map((s) => (
          <Link
            key={s.key}
            href={buildHref({ stage: s.key })}
            className={`${baseChip} ${
              activeStage === s.key ? chipActive : chipInactive
            }`}
            style={
              activeStage === s.key
                ? {
                    borderColor: s.color,
                    color: s.color,
                    backgroundColor: `${s.color}1a`,
                  }
                : undefined
            }
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
            <span className="text-xs opacity-70">
              {stageCounts[s.key] ?? 0}
            </span>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <form
        method="GET"
        className="flex flex-wrap items-center gap-2 bg-white border border-gray-4 rounded-xl px-3 py-2"
      >
        {activeStage && <input type="hidden" name="stage" value={activeStage} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="border border-gray-3 rounded-md h-9 px-3 text-sm focus:border-primary focus:outline-none bg-white text-dark-1 flex-1 min-w-[200px]"
        />
        <select
          name="job"
          defaultValue={activeJob}
          className="border border-gray-3 rounded-md h-9 px-3 text-sm focus:border-primary focus:outline-none bg-white text-dark-1"
        >
          <option value="">All jobs</option>
          {(jobOpts ?? []).map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary text-white rounded-md px-4 h-9 font-semibold text-sm hover:bg-primary-hover transition-colors"
        >
          Apply
        </button>
        {(activeStage || activeJob || q) && (
          <Link
            href="/admin/applications"
            className="text-sm text-gray-1 hover:text-dark-1 px-2"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="bg-white border border-gray-4 rounded-xl overflow-hidden">
        {apps && apps.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-5 text-xs uppercase tracking-wider text-gray-1">
              <tr>
                <th className="text-left px-4 py-3">Applicant</th>
                <th className="text-left px-4 py-3">Job</th>
                <th className="text-left px-4 py-3">Stage</th>
                <th className="text-left px-4 py-3">Rating</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">CV</th>
                <th className="text-left px-4 py-3">Last update</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a: any) => {
                const stage = resolveStage(stages, a.stage);
                return (
                  <tr
                    key={a.id}
                    className="border-t border-gray-4 hover:bg-gray-5/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/applications/${a.id}`}
                        className="font-semibold text-dark-1 hover:text-primary"
                      >
                        {a.form_type === "refer"
                          ? a.candidate_name || a.name
                          : a.name}
                      </Link>
                      <div className="text-xs text-gray-1">
                        {a.form_type === "refer"
                          ? a.candidate_email || a.email
                          : a.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-1">
                      {a.jobs?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StageBadge stage={stage} />
                        <StageSelect
                          applicationId={a.id}
                          current={a.stage}
                          stages={stages}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RatingInput
                        applicationId={a.id}
                        current={a.rating ?? 0}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          a.form_type === "refer"
                            ? "bg-primary-tint text-primary"
                            : "bg-positive-light text-positive"
                        }`}
                      >
                        {a.form_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.cv_url && cvUrls[a.id] ? (
                        <a
                          href={cvUrls[a.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-semibold hover:underline text-xs"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-2 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-1 text-xs">
                      {new Date(
                        a.last_stage_change_at ?? a.created_at
                      ).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-10 text-center text-gray-1 text-sm">
            {total === 0
              ? "No applications yet."
              : "No applications match the current filters."}
          </div>
        )}
      </div>
    </div>
  );
}
