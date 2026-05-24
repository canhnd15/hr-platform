import Link from "next/link";
import type { Metadata } from "next";
import { ApplyForm } from "@/components/ApplyForm";
import { JobShare } from "@/components/JobShare";
import { Markdown } from "@/components/Markdown";
import { getJobBySlugForTenant, getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string; jobSlug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) return { title: "Job Detail" };
  const job = await getJobBySlugForTenant(tenant.id, params.jobSlug);
  if (!job) return { title: `Job Detail | ${tenant.company.name}` };

  const title = `${job.title} — ${tenant.company.name}`;
  const description = (job.description || "").slice(0, 200);
  const url = `/u/${tenant.slug}/jobs/${job.slug}`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: tenant.company.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();

  const job = await getJobBySlugForTenant(tenant.id, params.jobSlug);

  if (!job) {
    return (
      <div className="detail-body">
        <p className="detail-state error">
          Job not found.&nbsp;
          <Link href={`/u/${params.slug}`} className="underline text-primary">
            Back to listings
          </Link>
        </p>
      </div>
    );
  }

  const typeBadgeClass =
    job.type === "Part-Time" ? "badge-warning" : "badge-success";

  return (
    <>
      <section className="detail-topbar">
        <div className="detail-topbar-inner">
          <div className="detail-logo">
            <svg viewBox="0 0 22 30" fill="none" aria-hidden="true">
              <path
                d="M3 3h16v6H3zM3 12h16v6H3zM3 21h10v6H3z"
                fill="var(--primary)"
                opacity="0.85"
              />
            </svg>
          </div>
          <div className="detail-heading">
            <div className="detail-title-row">
              <h1 className="detail-title">{job.title}</h1>
              <span className="badge badge-outline">{job.level}</span>
            </div>
            <div className="detail-company-row">
              <Link href={`/u/${params.slug}/information`} className="detail-company">
                {tenant.company.name}
              </Link>
              <span className={`badge ${typeBadgeClass}`}>{job.type}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="detail-body">
        <div className="detail-main">
          {job.description && (
            <div className="detail-section">
              <h2 className="detail-section-title">Job Description</h2>
              <Markdown source={job.description} />
            </div>
          )}
          {job.requirements && (
            <div className="detail-section">
              <h2 className="detail-section-title">Requirements</h2>
              <Markdown source={job.requirements} />
            </div>
          )}
          {job.benefits && (
            <div className="detail-section">
              <h2 className="detail-section-title">Benefits</h2>
              <Markdown source={job.benefits} />
            </div>
          )}
        </div>

        <aside className="detail-sidebar">
          <div className="job-overview-card">
            <h3 className="job-overview-title">Job Overview</h3>
            <div className="job-overview-grid">
              <div className="overview-item">
                <svg
                  className="overview-icon"
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M16 18a4 4 0 100-8 4 4 0 000 8z" />
                  <path d="M16 29s10-9 10-17a10 10 0 10-20 0c0 8 10 17 10 17z" />
                </svg>
                <div className="overview-text">
                  <span className="overview-item-label">Job Location</span>
                  <span className="overview-item-value">
                    {job.location}
                    {job.locationType ? ` · ${job.locationType}` : ""}
                  </span>
                </div>
              </div>

              <div className="overview-item">
                <svg
                  className="overview-icon"
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="4" y="8" width="24" height="18" rx="2" />
                  <path d="M4 12h24M22 18h2" />
                </svg>
                <div className="overview-text">
                  <span className="overview-item-label">Salary</span>
                  <span className="overview-item-value">{job.salary}</span>
                </div>
              </div>

              <div className="overview-item">
                <svg
                  className="overview-icon"
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M16 4l12 6-12 6L4 10l12-6z" />
                  <path d="M4 16l12 6 12-6M4 22l12 6 12-6" />
                </svg>
                <div className="overview-text">
                  <span className="overview-item-label">Job Level</span>
                  <span className="overview-item-value">{job.level}</span>
                </div>
              </div>
            </div>
          </div>

          <JobShare
            jobTitle={job.title}
            tenantSlug={tenant.slug}
            jobSlug={job.slug}
          />

          <ApplyForm
            jobTitle={job.title}
            tenantId={tenant.id}
            jobId={job.id}
          />
        </aside>
      </div>
    </>
  );
}
