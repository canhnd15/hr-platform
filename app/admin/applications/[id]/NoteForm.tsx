"use client";

import { useRef } from "react";
import { SubmitButton, ToastForm } from "@/components/admin/ToastForm";
import { addApplicationNoteAction } from "@/app/admin/applications/actions";

export function NoteForm({ applicationId }: { applicationId: string }) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  return (
    <ToastForm
      action={addApplicationNoteAction}
      className="flex flex-col gap-2"
      onSubmitted={(state) => {
        if (state.ok && ref.current) ref.current.value = "";
      }}
    >
      <input type="hidden" name="id" value={applicationId} />
      <textarea
        ref={ref}
        name="note"
        rows={3}
        required
        className="border border-gray-3 rounded-md px-3 py-2 text-sm bg-white text-dark-1 leading-relaxed focus:border-primary focus:outline-none"
        placeholder="Add a note — interview feedback, follow-ups, etc."
      />
      <div className="flex justify-end">
        <SubmitButton
          className="bg-primary text-white rounded-full px-5 h-9 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors text-sm"
          pendingLabel="Saving…"
        >
          Add note
        </SubmitButton>
      </div>
    </ToastForm>
  );
}
