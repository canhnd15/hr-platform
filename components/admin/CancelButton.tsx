"use client";

import { useRouter } from "next/navigation";

/**
 * Discards local form state by reloading the current admin page from the
 * server. Server data is re-fetched, so any user edits in client repeaters
 * are wiped. Confirms before discarding.
 */
export function CancelButton({
  className = "",
  href,
}: {
  className?: string;
  href?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        const ok = window.confirm("Discard your unsaved changes?");
        if (!ok) return;
        if (href) router.push(href);
        else router.refresh();
      }}
      className={`border border-gray-3 text-dark-1 rounded-full px-5 h-11 font-semibold hover:bg-gray-5 transition-colors inline-flex items-center ${className}`}
    >
      Cancel
    </button>
  );
}
