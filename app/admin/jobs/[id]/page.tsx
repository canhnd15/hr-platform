import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AdminCard,
  Field,
  FlashBanner,
  inputCls,
  textareaCls,
} from "@/components/admin/AdminCard";
import { saveJobAction } from "@/app/admin/jobs/actions";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function JobEditPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const me = await getCurrentUserTenant();
  if (!me) redirect("/login");

  const isNew = params.id === "new";
  let job: any = null;
  if (!isNew) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", params.id)
      .eq("tenant_id", me.tenantId)
      .single();
    if (!data) notFound();
    job = data;
  }

  return (
    <form action={saveJobAction} className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/jobs"
          className="text-sm text-gray-1 hover:text-dark-1"
        >
          ← Back to jobs
        </Link>
      </div>

      <FlashBanner message={searchParams.error} kind="error" />

      <input type="hidden" name="id" value={isNew ? "new" : params.id} />

      <AdminCard title={isNew ? "New job" : "Edit job"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" className="sm:col-span-2">
            <input
              name="title"
              defaultValue={job?.title ?? ""}
              className={inputCls}
              required
              placeholder="Senior Backend Engineer"
            />
          </Field>
          <Field label="Level">
            <input
              name="level"
              defaultValue={job?.level ?? ""}
              className={inputCls}
              placeholder="Senior"
            />
          </Field>
          <Field label="Type">
            <select
              name="type"
              defaultValue={job?.type ?? "Full-Time"}
              className={inputCls}
            >
              <option>Full-Time</option>
              <option>Part-Time</option>
              <option>Internship</option>
            </select>
          </Field>
          <Field label="Salary">
            <input
              name="salary"
              defaultValue={job?.salary ?? ""}
              className={inputCls}
              placeholder="$2,500 - $4,000"
            />
          </Field>
          <Field label="Status">
            <select
              name="status"
              defaultValue={job?.status ?? "draft"}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Company / department" className="sm:col-span-2">
            <input
              name="company"
              defaultValue={job?.company ?? ""}
              className={inputCls}
              placeholder="Engineering & Technology — Acme Co"
            />
          </Field>
          <Field label="Location" className="sm:col-span-2">
            <input
              name="location"
              defaultValue={job?.location ?? ""}
              className={inputCls}
              placeholder="Hanoi, Vietnam"
            />
          </Field>
          <Field
            label="Display order"
            hint="Lower numbers show first. Leave 0 to auto-append."
          >
            <input
              type="number"
              name="display_order"
              defaultValue={job?.display_order ?? 0}
              className={inputCls}
            />
          </Field>
          <label className="flex items-center gap-3 mt-7">
            <input
              type="checkbox"
              name="is_hot"
              defaultChecked={job?.is_hot ?? false}
              className="w-5 h-5 accent-primary"
            />
            <span className="text-sm text-dark-1">
              Mark as <strong>HOT</strong> (shows ribbon)
            </span>
          </label>
        </div>
      </AdminCard>

      <AdminCard
        title="Description"
        description="Paragraphs separated by a blank line."
      >
        <textarea
          name="description"
          defaultValue={job?.description ?? ""}
          className={textareaCls}
          rows={6}
        />
      </AdminCard>

      <AdminCard title="Requirements" description="One bullet per line.">
        <textarea
          name="requirements"
          defaultValue={job?.requirements ?? ""}
          className={textareaCls}
          rows={6}
        />
      </AdminCard>

      <AdminCard title="Benefits" description="One bullet per line.">
        <textarea
          name="benefits"
          defaultValue={job?.benefits ?? ""}
          className={textareaCls}
          rows={6}
        />
      </AdminCard>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/jobs"
          className="border border-gray-3 text-dark-1 rounded-full px-5 h-11 font-semibold hover:bg-gray-5 transition-colors inline-flex items-center"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors"
        >
          {isNew ? "Create job" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
