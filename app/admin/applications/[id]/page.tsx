import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminCard,
  Field,
  inputCls,
} from "@/components/admin/AdminCard";
import { RatingInput } from "@/components/admin/RatingInput";
import { StageBadge } from "@/components/admin/StageBadge";
import { StageSelect } from "@/components/admin/StageSelect";
import {
  getApplicationStagesForTenant,
  REJECT_REASONS,
  resolveStage,
} from "@/lib/application-stages";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NoteForm } from "./NoteForm";
import { RejectPanel } from "./RejectPanel";

export const dynamic = "force-dynamic";

const REJECT_REASON_LABEL: Record<string, string> = Object.fromEntries(
  REJECT_REASONS.map((r) => [r.key, r.label])
);

export default async function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const { data: app } = await supabase
    .from("applications")
    .select(
      "id, form_type, name, phone, email, candidate_name, candidate_phone, candidate_email, cv_url, stage, rating, last_stage_change_at, created_at, jobs(id, title)"
    )
    .eq("id", params.id)
    .eq("tenant_id", me.tenantId)
    .maybeSingle();

  if (!app) notFound();
  const a = app as any;

  const stages = await getApplicationStagesForTenant(
    supabase as any,
    me.tenantId
  );
  const currentStage = resolveStage(stages, a.stage);

  let cvUrl: string | null = null;
  if (a.cv_url) {
    const { data } = await supabase.storage
      .from("cvs")
      .createSignedUrl(a.cv_url, 3600);
    cvUrl = data?.signedUrl ?? null;
  }

  const { data: events } = await supabase
    .from("application_events")
    .select("*")
    .eq("application_id", a.id)
    .eq("tenant_id", me.tenantId)
    .order("created_at", { ascending: false });

  const candidateName =
    a.form_type === "refer" ? a.candidate_name || a.name : a.name;
  const candidateEmail =
    a.form_type === "refer" ? a.candidate_email || a.email : a.email;
  const candidatePhone =
    a.form_type === "refer" ? a.candidate_phone || a.phone : a.phone;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/applications"
          className="text-sm text-gray-1 hover:text-dark-1"
        >
          ← Back to applications
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-dark-1">
            {candidateName || "Application"}
          </h2>
          <p className="text-sm text-gray-1 mt-1">
            Submitted {new Date(a.created_at).toLocaleString()} ·{" "}
            <span className="text-dark-1 font-semibold">
              {a.jobs?.title ?? "(no job)"}
            </span>
          </p>
        </div>
        <StageBadge stage={currentStage} size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-4 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <AdminCard title="Candidate">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Name">
                <input
                  className={inputCls}
                  defaultValue={candidateName ?? ""}
                  readOnly
                />
              </Field>
              <Field label="Email">
                <input
                  className={inputCls}
                  defaultValue={candidateEmail ?? ""}
                  readOnly
                />
              </Field>
              <Field label="Phone">
                <input
                  className={inputCls}
                  defaultValue={candidatePhone ?? ""}
                  readOnly
                />
              </Field>
              <Field label="Type">
                <input
                  className={inputCls}
                  defaultValue={a.form_type === "refer" ? "Referral" : "Direct apply"}
                  readOnly
                />
              </Field>
              {a.form_type === "refer" && (
                <>
                  <Field label="Referrer name" className="sm:col-span-2">
                    <input className={inputCls} defaultValue={a.name} readOnly />
                  </Field>
                  <Field label="Referrer email">
                    <input className={inputCls} defaultValue={a.email} readOnly />
                  </Field>
                  <Field label="Referrer phone">
                    <input className={inputCls} defaultValue={a.phone} readOnly />
                  </Field>
                </>
              )}
              <Field label="CV" className="sm:col-span-2">
                {cvUrl ? (
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline text-sm"
                  >
                    Download CV ↗
                  </a>
                ) : (
                  <span className="text-gray-2 text-sm">No CV attached</span>
                )}
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="Pipeline">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Stage">
                <StageSelect
                  applicationId={a.id}
                  current={a.stage}
                  stages={stages}
                  size="md"
                />
              </Field>
              <Field label="Rating">
                <div className="h-11 inline-flex items-center">
                  <RatingInput
                    applicationId={a.id}
                    current={a.rating ?? 0}
                    size="md"
                  />
                </div>
              </Field>
            </div>

            <div className="mt-4">
              <RejectPanel applicationId={a.id} />
            </div>
          </AdminCard>

          <AdminCard title="Add note">
            <NoteForm applicationId={a.id} />
          </AdminCard>
        </div>

        {/* Right column — timeline */}
        <AdminCard
          title="Timeline"
          description="Every stage change, rating, note, and rejection is logged here."
        >
          <ol className="flex flex-col gap-3">
            {(events ?? []).length === 0 && (
              <li className="text-sm text-gray-2">
                No events yet. Move the stage or add a note to start the
                timeline.
              </li>
            )}
            {(events ?? []).map((e: any) => {
              const ts = new Date(e.created_at).toLocaleString();
              const from = e.from_stage
                ? resolveStage(stages, e.from_stage)
                : null;
              const to = e.to_stage
                ? resolveStage(stages, e.to_stage)
                : null;

              return (
                <li
                  key={e.id}
                  className="border border-gray-4 rounded-lg p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-sm">
                      <EventIcon kind={e.kind} />
                      <strong className="text-dark-1 capitalize">
                        {e.kind.replace("_", " ")}
                      </strong>
                      {e.kind === "stage_change" && from && to && (
                        <span className="text-gray-1 text-xs inline-flex items-center gap-2">
                          <StageBadge stage={from} />
                          <span>→</span>
                          <StageBadge stage={to} />
                        </span>
                      )}
                      {e.kind === "reject" && to && (
                        <span className="text-gray-1 text-xs inline-flex items-center gap-2">
                          <StageBadge stage={to} />
                          {e.reject_reason && (
                            <span className="text-[#d70000] font-medium">
                              ({REJECT_REASON_LABEL[e.reject_reason] ??
                                e.reject_reason})
                            </span>
                          )}
                        </span>
                      )}
                      {e.kind === "rating" && (
                        <span className="text-[#f59e0b] font-medium">
                          {"★".repeat(e.rating ?? 0)}
                          <span className="text-gray-3">
                            {"☆".repeat(5 - (e.rating ?? 0))}
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-2">{ts}</span>
                  </div>
                  {e.note && (
                    <p className="text-sm text-dark-3 whitespace-pre-wrap mt-1">
                      {e.note}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </AdminCard>
      </div>
    </div>
  );
}

function EventIcon({ kind }: { kind: string }) {
  const map: Record<string, string> = {
    stage_change: "↪",
    rating: "★",
    note: "✎",
    reject: "✕",
  };
  return (
    <span className="w-6 h-6 rounded-full bg-gray-5 grid place-items-center text-sm text-gray-1">
      {map[kind] ?? "•"}
    </span>
  );
}
