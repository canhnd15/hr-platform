"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { idleState, type ActionState } from "@/lib/action-state";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

export function ToastForm({
  action,
  children,
  className = "",
  encType,
  id,
  onSubmitted,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  encType?: string;
  id?: string;
  onSubmitted?: (state: ActionState) => void;
}) {
  const [state, dispatch] = useFormState(action, idleState);
  const toast = useToast();
  const router = useRouter();
  const lastTs = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!state.ts || state.ts === lastTs.current) return;
    lastTs.current = state.ts;
    if (state.message) {
      toast(state.message, state.ok ? "success" : "error");
    }
    if (state.ok && state.redirect) {
      router.push(state.redirect);
    } else if (state.ok) {
      router.refresh();
    }
    onSubmitted?.(state);
  }, [state, toast, router, onSubmitted]);

  return (
    <form
      id={id}
      action={dispatch}
      className={className}
      encType={encType as React.FormHTMLAttributes<HTMLFormElement>["encType"]}
    >
      {children}
    </form>
  );
}

export function SubmitButton({
  children,
  className,
  pendingLabel = "Saving…",
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className ?? ""} ${pending ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
