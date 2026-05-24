"use client";

import { useState } from "react";

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

/* ============================================================
   Locations (string list)
   ============================================================ */
export function LocationListEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string[];
}) {
  const [items, setItems] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && (
          <p className="text-sm text-gray-2">
            No custom locations yet — the public site will infer them from your
            jobs.
          </p>
        )}
        {items.map((loc, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 bg-primary-tint text-primary rounded-full pl-3 pr-1 py-1 text-sm font-medium"
          >
            {loc}
            <button
              type="button"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
              className="w-6 h-6 grid place-items-center rounded-full hover:bg-white/60 text-base leading-none"
              aria-label={`Remove ${loc}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = draft.trim();
              if (v && !items.includes(v)) setItems([...items, v]);
              setDraft("");
            }
          }}
          placeholder="Hanoi, Vietnam"
          className={`${inputCls} flex-1`}
        />
        <button
          type="button"
          onClick={() => {
            const v = draft.trim();
            if (v && !items.includes(v)) setItems([...items, v]);
            setDraft("");
          }}
          className="bg-primary text-white rounded-md px-4 h-10 font-semibold hover:bg-primary-hover transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Levels ({value,label})
   ============================================================ */
type Level = { value: string; label: string };
export function LevelListEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: Level[];
}) {
  const [items, setItems] = useState<Level[]>(defaultValue);
  const update = (i: number, patch: Partial<Level>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="grid grid-cols-[1fr,1fr,auto] gap-2 text-xs font-semibold text-gray-2 px-1">
        <span>Value</span>
        <span>Label</span>
        <span />
      </div>
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
          <input
            className={inputCls}
            value={it.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder="senior"
          />
          <input
            className={inputCls}
            value={it.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Senior"
          />
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
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className={`${btnGhost} self-start`}
        onClick={() => setItems([...items, { value: "", label: "" }])}
      >
        + Add level
      </button>
    </div>
  );
}

/* ============================================================
   Categories ({value,label,keyword})
   ============================================================ */
type Category = { value: string; label: string; keyword: string };
export function CategoryListEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: Category[];
}) {
  const [items, setItems] = useState<Category[]>(defaultValue);
  const update = (i: number, patch: Partial<Category>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 text-xs font-semibold text-gray-2 px-1">
        <span>Value</span>
        <span>Label</span>
        <span>Keyword (matched against job.company)</span>
        <span />
      </div>
      {items.map((it, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 items-center"
        >
          <input
            className={inputCls}
            value={it.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder="engineering"
          />
          <input
            className={inputCls}
            value={it.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Engineering & Technology"
          />
          <input
            className={inputCls}
            value={it.keyword}
            onChange={(e) => update(i, { keyword: e.target.value })}
            placeholder="engineering"
          />
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
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className={`${btnGhost} self-start`}
        onClick={() =>
          setItems([...items, { value: "", label: "", keyword: "" }])
        }
      >
        + Add category
      </button>
    </div>
  );
}

/* ============================================================
   Nav items ({href,label,enabled})
   ============================================================ */
type Nav = { href: string; label: string; enabled: boolean };
export function NavEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: Nav[];
}) {
  const [items, setItems] = useState<Nav[]>(defaultValue);
  const update = (i: number, patch: Partial<Nav>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="grid grid-cols-[1fr,1fr,auto,auto] gap-2 text-xs font-semibold text-gray-2 px-1">
        <span>Path</span>
        <span>Label</span>
        <span>Visible</span>
        <span />
      </div>
      {items.map((it, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr,1fr,auto,auto] gap-2 items-center"
        >
          <input
            className={inputCls}
            value={it.href}
            onChange={(e) => update(i, { href: e.target.value })}
            placeholder="/information"
          />
          <input
            className={inputCls}
            value={it.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Information"
          />
          <label className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={it.enabled}
              onChange={(e) => update(i, { enabled: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              className={btnGhost}
              onClick={() => setItems(move(items, i, i - 1))}
            >
              ↑
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => setItems(move(items, i, i + 1))}
            >
              ↓
            </button>
            <button
              type="button"
              className={btnRemove}
              onClick={() => setItems(items.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className={`${btnGhost} self-start`}
        onClick={() =>
          setItems([...items, { href: "/", label: "", enabled: true }])
        }
      >
        + Add nav item
      </button>
    </div>
  );
}

/* ============================================================
   Information sections ({title,body})
   ============================================================ */
type Section = { title: string; body: string };
export function SectionsEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: Section[];
}) {
  const [items, setItems] = useState<Section[]>(defaultValue);
  const update = (i: number, patch: Partial<Section>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((it, i) => (
        <div
          key={i}
          className="border border-gray-4 rounded-lg p-3 flex flex-col gap-2"
        >
          <input
            className={inputCls}
            value={it.title}
            onChange={(e) => update(i, { title: e.target.value })}
            placeholder="Section title (optional)"
          />
          <textarea
            className="border border-gray-3 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white text-dark-1 leading-relaxed min-h-[100px]"
            value={it.body}
            onChange={(e) => update(i, { body: e.target.value })}
            placeholder="Section body"
          />
          <div className="flex gap-1 justify-end">
            <button
              type="button"
              className={btnGhost}
              onClick={() => setItems(move(items, i, i - 1))}
            >
              ↑
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => setItems(move(items, i, i + 1))}
            >
              ↓
            </button>
            <button
              type="button"
              className={btnRemove}
              onClick={() => setItems(items.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className={`${btnGhost} self-start`}
        onClick={() => setItems([...items, { title: "", body: "" }])}
      >
        + Add section
      </button>
    </div>
  );
}

/* ============================================================
   Benefit groups ({title, bullets[]})
   ============================================================ */
type Group = { title: string; bullets: string[] };
export function BenefitGroupsEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: Group[];
}) {
  const [items, setItems] = useState<Group[]>(defaultValue);
  const update = (i: number, patch: Partial<Group>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((g, i) => (
        <div
          key={i}
          className="border border-gray-4 rounded-lg p-3 flex flex-col gap-2"
        >
          <input
            className={inputCls}
            value={g.title}
            onChange={(e) => update(i, { title: e.target.value })}
            placeholder="🎯 Group title"
          />
          <textarea
            className="border border-gray-3 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white text-dark-1 leading-relaxed min-h-[100px]"
            value={g.bullets.join("\n")}
            onChange={(e) =>
              update(i, {
                bullets: e.target.value
                  .split("\n")
                  .map((b) => b.trim())
                  .filter(Boolean),
              })
            }
            placeholder="One bullet per line"
          />
          <div className="flex gap-1 justify-end">
            <button
              type="button"
              className={btnGhost}
              onClick={() => setItems(move(items, i, i - 1))}
            >
              ↑
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => setItems(move(items, i, i + 1))}
            >
              ↓
            </button>
            <button
              type="button"
              className={btnRemove}
              onClick={() => setItems(items.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className={`${btnGhost} self-start`}
        onClick={() => setItems([...items, { title: "", bullets: [] }])}
      >
        + Add group
      </button>
    </div>
  );
}
