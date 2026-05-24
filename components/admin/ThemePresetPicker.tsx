"use client";

import { useState } from "react";

const PRESETS: {
  value: "kim" | "moc" | "thuy" | "hoa" | "tho" | "custom";
  label: string;
  swatch: string;
  blurb: string;
}[] = [
  { value: "thuy", label: "Thủy (Water)", swatch: "#036ae5", blurb: "Blue — calm, modern" },
  { value: "moc",  label: "Mộc (Wood)",   swatch: "#16a34a", blurb: "Green — natural, fresh" },
  { value: "hoa",  label: "Hỏa (Fire)",   swatch: "#dc2626", blurb: "Red — bold, dynamic" },
  { value: "tho",  label: "Thổ (Earth)",  swatch: "#92400e", blurb: "Brown — stable, warm" },
  { value: "kim",  label: "Kim (Metal)",  swatch: "#475569", blurb: "Slate — minimal, clean" },
  { value: "custom", label: "Custom", swatch: "linear-gradient(135deg,#036ae5,#dc2626)", blurb: "Pick your own primary color below" },
];

export function ThemePresetPicker({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string;
}) {
  const [selected, setSelected] = useState(defaultValue);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {PRESETS.map((p) => {
        const active = selected === p.value;
        return (
          <label
            key={p.value}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              active
                ? "border-primary bg-primary-tint"
                : "border-gray-4 hover:border-gray-3"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={p.value}
              checked={active}
              onChange={() => setSelected(p.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className="w-9 h-9 rounded-full shrink-0 border border-gray-4"
              style={{ background: p.swatch }}
            />
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-dark-1">
                {p.label}
              </span>
              <span className="text-xs text-gray-1">{p.blurb}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
