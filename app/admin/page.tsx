import Link from "next/link";
import { getApplicationStagesForTenant } from "@/lib/application-stages";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const [{ count: totalJobs }, { count: publishedJobs }, stages] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", me.tenantId),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", me.tenantId)
        .eq("status", "published"),
      getApplicationStagesForTenant(supabase as any, me.tenantId),
    ]);

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
  const totalApps = Object.values(stageCounts).reduce((a, b) => a + b, 0);
  const inPipeline = stages
    .filter((s) => !s.terminal)
    .reduce((a, s) => a + (stageCounts[s.key] ?? 0), 0);

  const topCards = [
    { label: "Total jobs", value: totalJobs ?? 0, href: "/admin/jobs" },
    { label: "Published", value: publishedJobs ?? 0, href: "/admin/jobs" },
    {
      label: "In pipeline",
      value: inPipeline,
      href: "/admin/applications",
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-dark-1">Welcome back</h2>
        <p className="text-sm text-gray-1 mt-1">
          Your public site is live at{" "}
          <Link
            href={`/u/${me.tenantSlug}`}
            target="_blank"
            className="text-primary font-semibold hover:underline"
          >
            /u/{me.tenantSlug}
          </Link>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {topCards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white border border-gray-4 rounded-xl p-5 hover:shadow-card hover:-translate-y-0.5 transition-all"
          >
            <p className="text-xs uppercase tracking-wider text-gray-2 font-semibold">
              {c.label}
            </p>
            <p className="text-3xl font-bold text-dark-1 mt-2">{c.value}</p>
          </Link>
        ))}
      </div>

      <section className="bg-white border border-gray-4 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-dark-1">
              Application pipeline
            </h3>
            <p className="text-xs text-gray-1 mt-1">
              {totalApps} total submissions
            </p>
          </div>
          <Link
            href="/admin/applications/stages"
            className="text-xs text-primary font-semibold hover:underline"
          >
            Manage stages →
          </Link>
        </div>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`,
          }}
        >
          {stages.map((s) => (
            <Link
              key={s.key}
              href={`/admin/applications?stage=${s.key}`}
              className="rounded-lg p-4 border transition-all hover:-translate-y-0.5 hover:shadow-card flex flex-col gap-1"
              style={{
                borderColor: `${s.color}33`,
                backgroundColor: `${s.color}0d`,
              }}
            >
              <span
                className="text-xs uppercase tracking-wider font-semibold"
                style={{ color: s.color }}
              >
                {s.label}
              </span>
              <span className="text-2xl font-bold text-dark-1">
                {stageCounts[s.key] ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="bg-white border border-gray-4 rounded-xl p-6">
        <h3 className="text-base font-semibold text-dark-1 mb-3">Quick start</h3>
        <ol className="text-sm text-dark-1 leading-7 list-decimal pl-5">
          <li>
            Fill in your profile and company info on{" "}
            <Link href="/admin/profile" className="text-primary font-semibold">
              Profile
            </Link>
            .
          </li>
          <li>
            Pick a theme on{" "}
            <Link href="/admin/branding" className="text-primary font-semibold">
              Branding
            </Link>
            .
          </li>
          <li>
            Configure which filter sections to show and add custom
            locations/levels/categories on{" "}
            <Link href="/admin/filters" className="text-primary font-semibold">
              Filters
            </Link>
            .
          </li>
          <li>
            Create your first job posting on{" "}
            <Link href="/admin/jobs" className="text-primary font-semibold">
              Jobs
            </Link>
            .
          </li>
        </ol>
      </div>
    </div>
  );
}
