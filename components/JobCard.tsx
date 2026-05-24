import type { Job } from "@/lib/types";

export function JobCard({ job, tenantSlug }: { job: Job; tenantSlug: string }) {
  const typeClass =
    job.type === "Full-Time"
      ? "badge-success"
      : job.type === "Part-Time"
        ? "badge-warning"
        : "badge-success";

  return (
    <a
      href={
        job.slug
          ? `/u/${tenantSlug}/jobs/${job.slug}`
          : `/u/${tenantSlug}/job-detail?id=${job.id}`
      }
      className="job-card text-current no-underline"
    >
      {job.isHot && (
        <div className="job-hot-ribbon" aria-label="Hot job">
          <span aria-hidden>🔥</span>
          <span>Hot</span>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-center flex-wrap gap-2">
          <h2
            className="font-semibold leading-snug text-dark-2"
            style={{ fontSize: "clamp(15px, 1.25vw, 18px)" }}
          >
            {job.title}
          </h2>
          <span className="badge badge-outline">{job.level}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${typeClass}`}>{job.type}</span>
          <span className="text-gray-2 text-sm whitespace-nowrap">
            Salary: {job.salary}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="company-logo">
          <svg viewBox="0 0 22 30" fill="none" aria-hidden="true">
            <path
              d="M3 3h16v6H3zM3 12h16v6H3zM3 21h10v6H3z"
              fill="var(--primary)"
              opacity="0.85"
            />
          </svg>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="text-dark-2 text-base whitespace-nowrap overflow-hidden text-ellipsis">
            {job.company}
          </p>
          <div className="flex items-center gap-1 text-gray-2 text-sm">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="shrink-0"
            >
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{job.location}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
