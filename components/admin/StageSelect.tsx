"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import type { ApplicationStage } from "@/lib/application-stages";
import { updateApplicationStageAction } from "@/app/admin/applications/actions";
import { idleState } from "@/lib/action-state";

export function StageSelect({
  applicationId,
  current,
  stages,
  size = "sm",
}: {
  applicationId: string;
  current: string;
  stages: ApplicationStage[];
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const lastRef = useRef(current);

  const cls =
    size === "md"
      ? "border border-gray-3 rounded-md h-10 px-3 text-sm focus:border-primary focus:outline-none bg-white text-dark-1"
      : "border border-gray-3 rounded-md h-8 px-2 text-xs focus:border-primary focus:outline-none bg-white text-dark-1";

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (next === lastRef.current) return;
    const prev = lastRef.current;
    lastRef.current = next;

    const targetStage = stages.find((s) => s.key === next);
    if (targetStage?.isReject) {
      // Reject flow needs a reason — bounce to detail page with hash.
      lastRef.current = prev;
      e.target.value = prev;
      router.push(`/admin/applications/${applicationId}#reject`);
      return;
    }

    const fd = new FormData();
    fd.set("id", applicationId);
    fd.set("stage", next);

    startTransition(async () => {
      const res = await updateApplicationStageAction(idleState, fd);
      if (res.ok) {
        toast(res.message || "Stage updated", "success");
        router.refresh();
      } else {
        // revert
        lastRef.current = prev;
        e.target.value = prev;
        toast(res.message || "Failed to update", "error");
      }
    });
  };

  return (
    <select
      value={current}
      onChange={onChange}
      disabled={pending}
      className={cls}
    >
      {stages.map((s) => (
        <option key={s.key} value={s.key}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
