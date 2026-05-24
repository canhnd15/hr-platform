import {
  AdminCard,
  Field,
  inputCls,
  textareaCls,
} from "@/components/admin/AdminCard";
import {
  AboutModeFields,
  EducationEditor,
  ExperienceEditor,
  SkillsEditor,
} from "@/components/admin/AboutEditors";
import { CancelButton } from "@/components/admin/CancelButton";
import {
  SubmitButton,
  ToastForm,
} from "@/components/admin/ToastForm";
import { saveAboutAction } from "@/app/admin/about/actions";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AboutContent = {
  mode?: "cv_upload" | "template";
  cvUrl?: string | null;
  cvFileName?: string | null;
  about?: string;
  skills?: string[];
  experiences?: {
    title: string;
    company: string;
    period: string;
    description: string;
  }[];
  education?: { school: string; degree: string; period: string }[];
};

export default async function AboutAdminPage() {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const { data: page } = await supabase
    .from("tenant_pages")
    .select("visible, content")
    .eq("tenant_id", me.tenantId)
    .eq("page_key", "about")
    .maybeSingle();

  const content = (page?.content ?? {}) as AboutContent;
  const visible = page?.visible ?? true;
  const mode = content.mode === "cv_upload" ? "cv_upload" : "template";

  const cvBlock = (
    <div className="flex flex-col gap-3 border border-gray-4 rounded-lg p-4 mt-3">
      <Field
        label="CV file (PDF)"
        hint="Replaces the current CV. Leave empty to keep the existing file."
      >
        <input
          type="file"
          name="cv_file"
          accept="application/pdf"
          className="text-sm"
        />
      </Field>
      {content.cvUrl ? (
        <div className="flex flex-col gap-2 bg-gray-5 border border-gray-4 rounded-md p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-semibold text-dark-1">
                {content.cvFileName ?? "Current CV"}
              </span>
              <a
                href={content.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-xs hover:underline truncate"
              >
                {content.cvUrl}
              </a>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-[#d70000] font-semibold">
              <input type="checkbox" name="clear_cv" className="accent-[#d70000]" />
              Remove current CV
            </label>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-2">No CV uploaded yet.</p>
      )}
    </div>
  );

  const templateBlock = (
    <div className="flex flex-col gap-5 border border-gray-4 rounded-lg p-4 mt-3">
      <Field label="About / Bio">
        <textarea
          name="about"
          defaultValue={content.about ?? ""}
          className={textareaCls}
          rows={5}
          placeholder="A short paragraph introducing yourself."
        />
      </Field>

      <Field label="Skills" hint="Press Enter or click Add after each skill.">
        <SkillsEditor name="skills" defaultValue={content.skills ?? []} />
      </Field>

      <Field label="Experience">
        <ExperienceEditor
          name="experiences"
          defaultValue={content.experiences ?? []}
        />
      </Field>

      <Field label="Education">
        <EducationEditor
          name="education"
          defaultValue={content.education ?? []}
        />
      </Field>
    </div>
  );

  return (
    <ToastForm
      action={saveAboutAction}
      encType="multipart/form-data"
      className="flex flex-col gap-6 w-full"
    >
      <AdminCard
        title="About page"
        description="Tell visitors who you are. Choose to upload your CV or build a structured profile."
      >
        <div className="flex flex-col gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="about_visible"
              defaultChecked={visible}
              className="w-5 h-5 accent-primary"
            />
            <span className="text-dark-1">
              Show the About page on the public site
            </span>
          </label>

          <AboutModeFields
            defaultMode={mode}
            cvBlock={cvBlock}
            templateBlock={templateBlock}
          />
        </div>
      </AdminCard>

      <div className="flex justify-end gap-3">
        <CancelButton />
        <SubmitButton className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors">
          Save changes
        </SubmitButton>
      </div>
    </ToastForm>
  );
}
