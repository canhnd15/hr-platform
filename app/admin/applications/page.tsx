import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const { data: apps } = await supabase
    .from("applications")
    .select(
      "id, form_type, name, phone, email, candidate_name, candidate_phone, candidate_email, cv_url, created_at, jobs(title)"
    )
    .eq("tenant_id", me.tenantId)
    .order("created_at", { ascending: false });

  // CVs are stored as raw storage paths in cv_url; mint signed URLs for download.
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

  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-dark-1">Applications</h2>
        <p className="text-sm text-gray-1 mt-1">
          Submissions from the apply / refer-a-friend form.
        </p>
      </div>

      <div className="bg-white border border-gray-4 rounded-xl overflow-hidden">
        {apps && apps.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-5 text-xs uppercase tracking-wider text-gray-1">
              <tr>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Job</th>
                <th className="text-left px-4 py-3">Applicant / Referrer</th>
                <th className="text-left px-4 py-3">Candidate (if referral)</th>
                <th className="text-left px-4 py-3">CV</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a: any) => (
                <tr key={a.id} className="border-t border-gray-4 align-top">
                  <td className="px-4 py-3 text-gray-1 text-xs">
                    {new Date(a.created_at).toLocaleString()}
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
                  <td className="px-4 py-3 text-dark-1">
                    {a.jobs?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-dark-1">
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-xs text-gray-1">{a.email}</div>
                    <div className="text-xs text-gray-1">{a.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-dark-1">
                    {a.candidate_name ? (
                      <>
                        <div className="font-semibold">{a.candidate_name}</div>
                        <div className="text-xs text-gray-1">
                          {a.candidate_email}
                        </div>
                        <div className="text-xs text-gray-1">
                          {a.candidate_phone}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-2 text-xs">—</span>
                    )}
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
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-10 text-center text-gray-1 text-sm">
            No applications yet.
          </div>
        )}
      </div>
    </div>
  );
}
