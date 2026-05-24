import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";
import { SubmitButton, ToastForm } from "@/components/admin/ToastForm";
import { StagesEditor } from "@/components/admin/StagesEditor";
import { saveStagesAction } from "@/app/admin/applications/stages/actions";
import {
  type ApplicationStage,
  DEFAULT_STAGES,
} from "@/lib/application-stages";
import { getCurrentUserTenant } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StagesAdminPage() {
  const me = (await getCurrentUserTenant())!;
  const supabase = createSupabaseServerClient();

  const [{ data: ui }, { data: appRows }] = await Promise.all([
    supabase
      .from("tenant_ui_config")
      .select("application_stages")
      .eq("tenant_id", me.tenantId)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("stage")
      .eq("tenant_id", me.tenantId),
  ]);

  const raw = (ui?.application_stages ?? []) as unknown;
  const stages: ApplicationStage[] =
    Array.isArray(raw) && raw.length > 0
      ? (raw as ApplicationStage[])
      : DEFAULT_STAGES;
  const lockedKeys = Array.from(
    new Set((appRows ?? []).map((r) => r.stage as string))
  );

  return (
    <ToastForm action={saveStagesAction} className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-1">Application stages</h2>
          <p className="text-sm text-gray-1 mt-1">
            Customize how applications flow through your pipeline.{" "}
            <Link
              href="/admin/applications"
              className="text-primary font-semibold hover:underline"
            >
              Back to Applications
            </Link>
          </p>
        </div>
      </div>

      <AdminCard
        title="Stages"
        description="Order, rename, recolor. Mark terminal stages (e.g. Hired/Rejected) so they're excluded from 'in pipeline' counts. Exactly one stage may carry the Reject flag — it gates the reject-reason prompt."
      >
        <StagesEditor
          name="stages"
          defaultValue={stages}
          lockedKeys={lockedKeys}
        />
      </AdminCard>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/applications"
          className="border border-gray-3 text-dark-1 rounded-full px-5 h-11 font-semibold hover:bg-gray-4/40 transition-colors inline-flex items-center"
        >
          Cancel
        </Link>
        <SubmitButton className="bg-primary text-white rounded-full px-6 h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors">
          Save stages
        </SubmitButton>
      </div>
    </ToastForm>
  );
}
