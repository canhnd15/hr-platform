import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AdminCard,
  Field,
  inputCls,
} from "@/components/admin/AdminCard";
import { CancelButton } from "@/components/admin/CancelButton";
import { MarkdownInput } from "@/components/admin/MarkdownInput";
import { SlugInput } from "@/components/admin/SlugInput";
import { SubmitButton, ToastForm } from "@/components/admin/ToastForm";
import { saveJobAction } from "@/app/admin/jobs/actions";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COMMON_LEVELS = [
  "Intern",
  "Fresher",
  "Junior",
  "Middle",
  "Senior",
  "Leader",
  "Manager",
  "Director",
];

export default async function JobEditPage({
  params,
}: {
  params: { id: string };
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
    <ToastForm action={saveJobAction} className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/jobs"
          className="text-sm text-gray-1 hover:text-dark-1"
        >
          ← Back to jobs
        </Link>
      </div>

      <input type="hidden" name="id" value={isNew ? "new" : params.id} />

      <AdminCard title={isNew ? "New job" : "Edit job"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" className="sm:col-span-2">
            <input
              id="job-title-input"
              name="title"
              defaultValue={job?.title ?? ""}
              className={inputCls}
              required
              placeholder="Senior Backend Engineer"
            />
          </Field>

          <Field
            label="URL slug"
            hint="Auto-fills from the title — edit before saving for a custom URL. Changing the slug later breaks links to the old slug."
            className="sm:col-span-2"
          >
            <SlugInput
              name="slug"
              defaultValue={job?.slug ?? ""}
              titleInputId="job-title-input"
              previewPrefix={`/u/${me.tenantSlug}/jobs/`}
            />
          </Field>

          <Field
            label="Level"
            hint="Pick a common level or type your own."
          >
            <input
              name="level"
              defaultValue={job?.level ?? ""}
              className={inputCls}
              list="job-level-options"
              placeholder="Senior"
              autoComplete="off"
            />
            <datalist id="job-level-options">
              {COMMON_LEVELS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </Field>

          <Field label="Employment type">
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

          <Field label="Work mode">
            <select
              name="location_type"
              defaultValue={job?.location_type ?? "Onsite"}
              className={inputCls}
            >
              <option>Onsite</option>
              <option>Hybrid</option>
              <option>Remote</option>
            </select>
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
        </div>
      </AdminCard>

      <AdminCard
        title="Salary"
        description="Pick a currency and enter a numeric range. Or use the override for non-numeric values like 'Negotiable'."
      >
        <div className="grid grid-cols-[140px,1fr,1fr] gap-3 items-end">
          <Field label="Currency">
            <select
              name="salary_currency"
              defaultValue={job?.salary_currency ?? "USD"}
              className={inputCls}
            >
              <option value="USD">USD ($)</option>
              <option value="VND">VND (₫)</option>
            </select>
          </Field>
          <Field label="Min">
            <input
              type="text"
              inputMode="numeric"
              name="salary_min"
              defaultValue={job?.salary_min ?? ""}
              className={inputCls}
              placeholder="e.g. 2500 or 25000000"
            />
          </Field>
          <Field label="Max">
            <input
              type="text"
              inputMode="numeric"
              name="salary_max"
              defaultValue={job?.salary_max ?? ""}
              className={inputCls}
              placeholder="e.g. 4000 or 40000000"
            />
          </Field>
          <Field
            label="Display override"
            hint="If filled, this string is shown verbatim and replaces the range above. Use for 'Negotiable', 'Competitive', etc."
            className="col-span-3"
          >
            <input
              name="salary_override"
              defaultValue={
                job?.salary &&
                (job?.salary_min != null || job?.salary_max != null)
                  ? ""
                  : (job?.salary ?? "")
              }
              className={inputCls}
              placeholder="Negotiable"
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard title="Where">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        description="Markdown supported — use headings, lists, links, code blocks."
      >
        <MarkdownInput
          name="description"
          defaultValue={job?.description ?? ""}
          placeholder="What's the role about?"
        />
      </AdminCard>

      <AdminCard title="Requirements" description="Use a markdown list for bullets.">
        <MarkdownInput
          name="requirements"
          defaultValue={job?.requirements ?? ""}
          placeholder={"- 3+ years experience\n- Strong SQL\n- ..."}
        />
      </AdminCard>

      <AdminCard title="Benefits" description="Use a markdown list for bullets.">
        <MarkdownInput
          name="benefits"
          defaultValue={job?.benefits ?? ""}
          placeholder={"- Health insurance\n- Annual trip\n- ..."}
        />
      </AdminCard>

      <div className="flex justify-end gap-3">
        <CancelButton href="/admin/jobs" />
        <SubmitButton className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors">
          {isNew ? "Create job" : "Save changes"}
        </SubmitButton>
      </div>
    </ToastForm>
  );
}
