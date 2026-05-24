"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { updateApplicationRatingAction } from "@/app/admin/applications/actions";
import { idleState } from "@/lib/action-state";

export function RatingInput({
  applicationId,
  current,
  size = "sm",
}: {
  applicationId: string;
  current: number;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(current);
  const [hover, setHover] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const star = size === "md" ? "text-xl" : "text-base";

  const submit = (next: number) => {
    const fd = new FormData();
    fd.set("id", applicationId);
    fd.set("rating", String(next));
    startTransition(async () => {
      const res = await updateApplicationRatingAction(idleState, fd);
      if (res.ok) {
        setValue(next);
        toast(res.message || "Rating saved", "success");
        router.refresh();
      } else {
        toast(res.message || "Failed to save rating", "error");
      }
    });
  };

  return (
    <div className="inline-flex items-center" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (hover ?? value) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={pending}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            onClick={() => submit(n === value ? 0 : n)}
            className={`${star} leading-none px-0.5 ${
              filled ? "text-[#f59e0b]" : "text-gray-3"
            } hover:text-[#f59e0b] transition-colors`}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            title={n === value ? "Click to clear" : `${n} stars`}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
