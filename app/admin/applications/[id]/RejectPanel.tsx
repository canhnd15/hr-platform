"use client";

import { useState } from "react";
import { SubmitButton, ToastForm } from "@/components/admin/ToastForm";
import { rejectApplicationAction } from "@/app/admin/applications/actions";
import { REJECT_REASONS } from "@/lib/application-stages";

export function RejectPanel({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-[#d70000] font-semibold hover:underline self-start"
      >
        Reject application…
      </button>
    );
  }

  return (
    <ToastForm
      action={rejectApplicationAction}
      className="flex flex-col gap-3 border border-[#d70000]/30 bg-[#fce9e9]/50 rounded-lg p-3"
      id="reject"
    >
      <input type="hidden" name="id" value={applicationId} />
      <div className="text-sm font-semibold text-[#d70000]">Reject candidate</div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold text-dark-1">Reason</span>
        <select
          name="reason"
          required
          defaultValue=""
          className="border border-gray-3 rounded-md h-10 px-3 text-sm bg-white text-dark-1"
        >
          <option value="" disabled>
            Pick a reason…
          </option>
          {REJECT_REASONS.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold text-dark-1">Note (optional)</span>
        <textarea
          name="note"
          rows={3}
          className="border border-gray-3 rounded-md px-3 py-2 text-sm bg-white text-dark-1 leading-relaxed"
          placeholder="Any extra context…"
        />
      </label>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-gray-3 text-dark-1 rounded-full px-4 h-9 text-sm font-semibold hover:bg-gray-4/40"
        >
          Cancel
        </button>
        <SubmitButton
          className="bg-[#d70000] text-white rounded-full px-5 h-9 font-semibold hover:bg-[#b80000] text-sm"
          pendingLabel="Rejecting…"
        >
          Confirm reject
        </SubmitButton>
      </div>
    </ToastForm>
  );
}
