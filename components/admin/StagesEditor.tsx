"use client";

import { useState } from "react";
import { slugify } from "@/lib/slug";
import type { ApplicationStage } from "@/lib/application-stages";

const inputCls =
  "border border-gray-3 rounded-md h-10 px-3 text-sm focus:border-primary focus:outline-none bg-white text-dark-1";

const btnGhost =
  "text-sm text-primary font-semibold hover:bg-primary-tint px-3 h-9 rounded-md transition-colors";
const btnRemove =
  "text-sm text-[#d70000] font-semibold hover:bg-[#fce9e9] px-3 h-9 rounded-md transition-colors";

function move<T>(arr: T[], from: number, to: number) {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function StagesEditor({
  name,
  defaultValue,
  lockedKeys,
}: {
  name: string;
  defaultValue: ApplicationStage[];
  lockedKeys: string[]; // keys with applications attached → key field disabled
}) {
  const [items, setItems] = useState<ApplicationStage[]>(defaultValue);

  const update = (i: number, patch: Partial<ApplicationStage>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const setReject = (i: number) =>
    setItems(items.map((it, j) => ({ ...it, isReject: j === i })));

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="grid grid-cols-[1fr,1fr,90px,auto,auto,auto] gap-2 text-xs font-semibold text-gray-2 px-1">
        <span>Key</span>
        <span>Label</span>
        <span>Color</span>
        <span>Terminal</span>
        <span>Reject</span>
        <span />
      </div>

      {items.map((it, i) => {
        const locked = lockedKeys.includes(it.key);
        return (
          <div
            key={i}
            className="grid grid-cols-[1fr,1fr,90px,auto,auto,auto] gap-2 items-center"
          >
            <input
              className={inputCls}
              value={it.key}
              onChange={(e) =>
                update(i, { key: slugify(e.target.value) || it.key })
              }
              placeholder="new"
              disabled={locked}
              title={locked ? "Key is locked: applications exist for this stage" : undefined}
            />
            <input
              className={inputCls}
              value={it.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="New"
            />
            <input
              type="color"
              className="h-10 w-[90px] rounded-md border border-gray-3"
              value={it.color}
              onChange={(e) => update(i, { color: e.target.value })}
            />
            <label className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={it.terminal}
                onChange={(e) => update(i, { terminal: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
            </label>
            <label className="flex items-center justify-center">
              <input
                type="radio"
                name="__reject_flag"
                checked={!!it.isReject}
                onChange={() => setReject(i)}
                className="w-5 h-5 accent-primary"
              />
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                className={btnGhost}
                onClick={() => setItems(move(items, i, i - 1))}
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => setItems(move(items, i, i + 1))}
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className={btnRemove}
                onClick={() => setItems(items.filter((_, j) => j !== i))}
                disabled={locked}
                title={
                  locked
                    ? "Remove blocked: applications exist for this stage"
                    : undefined
                }
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className={`${btnGhost} self-start`}
        onClick={() =>
          setItems([
            ...items,
            {
              key: `stage-${items.length + 1}`,
              label: "New stage",
              color: "#94a3b8",
              terminal: false,
            },
          ])
        }
      >
        + Add stage
      </button>
    </div>
  );
}
