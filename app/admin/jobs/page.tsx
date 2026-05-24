import Link from "next/link";
import {
  deleteJobAction,
  duplicateJobAction,
  reorderJobAction,
  setJobStatusAction,
} from "@/app/admin/jobs/actions";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const statusPill = (status: string) => {
  if (status === "published") return "bg-positive-light text-positive";
  if (status === "draft") return "bg-gray-4 text-dark-1";
  return "bg-[#fce9e9] text-[#d70000]";
};

export default async function JobsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: jobs, count } = await supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("tenant_id", me.tenantId)
    .order("display_order", { ascending: true })
    .range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-1">Jobs</h2>
          <p className="text-sm text-gray-1 mt-1">
            {total} total · published jobs appear on{" "}
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
        <Link
          href="/admin/jobs/new"
          className="bg-primary text-white rounded-full px-5 h-10 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors inline-flex items-center"
        >
          + New job
        </Link>
      </div>

      <div className="bg-white border border-gray-4 rounded-xl overflow-hidden">
        {jobs && jobs.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-5 text-xs uppercase tracking-wider text-gray-1">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Level</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Mode</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j: any, i: number) => (
                <tr
                  key={j.id}
                  className={`border-t border-gray-4 ${
                    i % 2 === 0 ? "" : "bg-gray-5/30"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/jobs/${j.id}`}
                        className="font-semibold text-dark-1 hover:text-primary"
                      >
                        {j.title}
                      </Link>
                      <span className="text-xs text-gray-1">
                        {j.company} · {j.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-1">{j.level}</td>
                  <td className="px-4 py-3 text-dark-1">{j.type}</td>
                  <td className="px-4 py-3 text-dark-1">
                    {j.location_type ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusPill(
                        j.status
                      )}`}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <form action={reorderJobAction} className="inline">
                        <input type="hidden" name="id" value={j.id} />
                        <input type="hidden" name="dir" value="up" />
                        <button
                          type="submit"
                          className="text-gray-1 hover:text-dark-1 px-2 h-8 rounded hover:bg-gray-5"
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                      </form>
                      <form action={reorderJobAction} className="inline">
                        <input type="hidden" name="id" value={j.id} />
                        <input type="hidden" name="dir" value="down" />
                        <button
                          type="submit"
                          className="text-gray-1 hover:text-dark-1 px-2 h-8 rounded hover:bg-gray-5"
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      </form>
                      {j.status !== "published" ? (
                        <form action={setJobStatusAction} className="inline">
                          <input type="hidden" name="id" value={j.id} />
                          <input type="hidden" name="status" value="published" />
                          <button
                            type="submit"
                            className="text-positive hover:underline text-xs font-semibold px-2 h-8"
                          >
                            Publish
                          </button>
                        </form>
                      ) : (
                        <form action={setJobStatusAction} className="inline">
                          <input type="hidden" name="id" value={j.id} />
                          <input type="hidden" name="status" value="draft" />
                          <button
                            type="submit"
                            className="text-gray-1 hover:underline text-xs font-semibold px-2 h-8"
                          >
                            Unpublish
                          </button>
                        </form>
                      )}
                      <form action={duplicateJobAction} className="inline">
                        <input type="hidden" name="id" value={j.id} />
                        <button
                          type="submit"
                          className="text-primary hover:underline text-xs font-semibold px-2 h-8"
                        >
                          Duplicate
                        </button>
                      </form>
                      <Link
                        href={`/admin/jobs/${j.id}`}
                        className="text-primary hover:underline text-xs font-semibold px-2 h-8 inline-flex items-center"
                      >
                        Edit
                      </Link>
                      <form action={deleteJobAction} className="inline">
                        <input type="hidden" name="id" value={j.id} />
                        <button
                          type="submit"
                          className="text-[#d70000] hover:underline text-xs font-semibold px-2 h-8"
                          formNoValidate
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-10 text-center text-gray-1 text-sm">
            No jobs yet. Click <strong>+ New job</strong> to create one.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination page={clampedPage} totalPages={totalPages} />
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const hrefFor = (n: number) => `?page=${n}`;
  const prev = page > 1 ? hrefFor(page - 1) : null;
  const next = page < totalPages ? hrefFor(page + 1) : null;

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, Math.min(start, end - windowSize + 1));

  const numbers: number[] = [];
  for (let i = start; i <= end; i++) numbers.push(i);

  const base =
    "inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-md text-sm font-medium border";
  const active =
    "border-primary bg-primary text-white";
  const inactive =
    "border-gray-4 text-dark-1 hover:bg-gray-5";
  const disabled = "border-gray-4 text-gray-2 cursor-not-allowed";

  return (
    <nav className="flex items-center gap-2 justify-end" aria-label="Pagination">
      <Link
        href={prev ?? "#"}
        className={`${base} ${prev ? inactive : disabled}`}
        aria-disabled={!prev}
      >
        ← Prev
      </Link>
      {start > 1 && (
        <>
          <Link href={hrefFor(1)} className={`${base} ${inactive}`}>
            1
          </Link>
          {start > 2 && <span className="text-gray-2 px-1">…</span>}
        </>
      )}
      {numbers.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          className={`${base} ${n === page ? active : inactive}`}
          aria-current={n === page ? "page" : undefined}
        >
          {n}
        </Link>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="text-gray-2 px-1">…</span>
          )}
          <Link href={hrefFor(totalPages)} className={`${base} ${inactive}`}>
            {totalPages}
          </Link>
        </>
      )}
      <Link
        href={next ?? "#"}
        className={`${base} ${next ? inactive : disabled}`}
        aria-disabled={!next}
      >
        Next →
      </Link>
    </nav>
  );
}
