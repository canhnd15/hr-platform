"use client";

import { useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/slug";

export function SlugInput({
  name,
  defaultValue,
  titleInputId,
  previewPrefix,
}: {
  name: string;
  defaultValue: string;
  titleInputId: string;
  previewPrefix: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const touchedRef = useRef(defaultValue.length > 0);
  const lastAutoRef = useRef(defaultValue);

  useEffect(() => {
    const titleEl = document.getElementById(
      titleInputId
    ) as HTMLInputElement | null;
    if (!titleEl) return;

    const onTitle = () => {
      // Only auto-sync while the user hasn't manually changed the slug,
      // or the slug still matches our last auto-generated value.
      if (touchedRef.current && value !== lastAutoRef.current) return;
      const next = slugify(titleEl.value);
      lastAutoRef.current = next;
      setValue(next);
    };

    titleEl.addEventListener("input", onTitle);
    return () => titleEl.removeEventListener("input", onTitle);
  }, [titleInputId, value]);

  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => {
          touchedRef.current = true;
          setValue(slugify(e.target.value));
        }}
        className="border border-gray-3 rounded-md h-11 px-3 text-sm focus:border-primary focus:outline-none bg-white text-dark-1"
        placeholder="senior-backend-engineer"
        autoComplete="off"
      />
      <p className="text-xs text-gray-2 break-all">
        URL preview: <span className="text-dark-1">{previewPrefix}{value || "<slug>"}</span>
      </p>
    </div>
  );
}
