"use client";

import { useState } from "react";

const inputCls =
  "border border-gray-3 rounded-md h-10 px-3 text-sm focus:border-primary focus:outline-none bg-white text-dark-1";
const textareaCls =
  "border border-gray-3 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white text-dark-1 leading-relaxed";

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
   About mode switch (CV upload vs template)
   ============================================================ */
export function AboutModeSwitch({
  name,
  defaultValue,
  onChange,
}: {
  name: string;
  defaultValue: "cv_upload" | "template";
  onChange?: (v: "cv_upload" | "template") => void;
}) {
  const [mode, setMode] = useState<"cv_upload" | "template">(defaultValue);
  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={mode} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(
          [
            {
              key: "template" as const,
              title: "Build profile from template",
              desc: "Fill in bio, skills, experience and education — we'll style it for you.",
            },
            {
              key: "cv_upload" as const,
              title: "Upload your CV (PDF)",
              desc: "Visitors will see your CV embedded with a download button.",
            },
          ]
        ).map((opt) => {
          const selected = mode === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setMode(opt.key);
                onChange?.(opt.key);
              }}
              className={`text-left p-4 rounded-lg border-2 transition-colors ${
                selected
                  ? "border-primary bg-primary-tint"
                  : "border-gray-4 hover:border-gray-3"
              }`}
            >
              <p className="text-sm font-semibold text-dark-1">{opt.title}</p>
              <p className="text-xs text-gray-1 mt-1 leading-relaxed">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Skills (string[]) — tag-style
   ============================================================ */
export function SkillsEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string[];
}) {
  const [items, setItems] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !items.includes(v)) setItems([...items, v]);
    setDraft("");
  };
  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && (
          <p className="text-sm text-gray-2">
            No skills yet — add a few keywords visitors should know.
          </p>
        )}
        {items.map((skill, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 bg-primary-tint text-primary rounded-full pl-3 pr-1 py-1 text-sm font-medium"
          >
            {skill}
            <button
              type="button"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
              className="w-6 h-6 grid place-items-center rounded-full hover:bg-white/60 text-base leading-none"
              aria-label={`Remove ${skill}`}
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
              add();
            }
          }}
          placeholder="e.g. Tech recruitment"
          className={`${inputCls} flex-1`}
        />
        <button
          type="button"
          onClick={add}
          className="bg-primary text-white rounded-md px-4 h-10 font-semibold hover:bg-primary-hover transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Experiences ({title, company, period, description})
   ============================================================ */
type Experience = {
  title: string;
  company: string;
  period: string;
  description: string;
};
export function ExperienceEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: Experience[];
}) {
  const [items, setItems] = useState<Experience[]>(defaultValue);
  const update = (i: number, patch: Partial<Experience>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((it, i) => (
        <div
          key={i}
          className="border border-gray-4 rounded-lg p-3 flex flex-col gap-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              className={inputCls}
              value={it.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Job title (e.g. Senior Recruiter)"
            />
            <input
              className={inputCls}
              value={it.company}
              onChange={(e) => update(i, { company: e.target.value })}
              placeholder="Company"
            />
            <input
              className={`${inputCls} sm:col-span-2`}
              value={it.period}
              onChange={(e) => update(i, { period: e.target.value })}
              placeholder="Period (e.g. 2021 – Present)"
            />
          </div>
          <textarea
            className={textareaCls}
            rows={3}
            value={it.description}
            onChange={(e) => update(i, { description: e.target.value })}
            placeholder="Short description of what you did here."
          />
          <div className="flex gap-1 justify-end">
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
          setItems([
            ...items,
            { title: "", company: "", period: "", description: "" },
          ])
        }
      >
        + Add experience
      </button>
    </div>
  );
}

/* ============================================================
   Education ({school, degree, period})
   ============================================================ */
type Education = { school: string; degree: string; period: string };
export function EducationEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: Education[];
}) {
  const [items, setItems] = useState<Education[]>(defaultValue);
  const update = (i: number, patch: Partial<Education>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 text-xs font-semibold text-gray-2 px-1">
        <span>School</span>
        <span>Degree</span>
        <span>Period</span>
        <span />
      </div>
      {items.map((it, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 items-center"
        >
          <input
            className={inputCls}
            value={it.school}
            onChange={(e) => update(i, { school: e.target.value })}
            placeholder="School"
          />
          <input
            className={inputCls}
            value={it.degree}
            onChange={(e) => update(i, { degree: e.target.value })}
            placeholder="Degree"
          />
          <input
            className={inputCls}
            value={it.period}
            onChange={(e) => update(i, { period: e.target.value })}
            placeholder="2018 – 2022"
          />
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
          setItems([...items, { school: "", degree: "", period: "" }])
        }
      >
        + Add education
      </button>
    </div>
  );
}

/* ============================================================
   AboutModeFields — wraps the two mode sub-forms; toggles via radio state
   ============================================================ */
export function AboutModeFields({
  defaultMode,
  cvBlock,
  templateBlock,
}: {
  defaultMode: "cv_upload" | "template";
  cvBlock: React.ReactNode;
  templateBlock: React.ReactNode;
}) {
  const [mode, setMode] = useState<"cv_upload" | "template">(defaultMode);
  return (
    <>
      <input type="hidden" name="mode" value={mode} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(
          [
            {
              key: "template" as const,
              title: "Build profile from template",
              desc: "Fill in bio, skills, experience and education — we'll style it for you.",
            },
            {
              key: "cv_upload" as const,
              title: "Upload your CV (PDF)",
              desc: "Visitors will see your CV embedded with a download button.",
            },
          ]
        ).map((opt) => {
          const selected = mode === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setMode(opt.key)}
              className={`text-left p-4 rounded-lg border-2 transition-colors ${
                selected
                  ? "border-primary bg-primary-tint"
                  : "border-gray-4 hover:border-gray-3"
              }`}
            >
              <p className="text-sm font-semibold text-dark-1">{opt.title}</p>
              <p className="text-xs text-gray-1 mt-1 leading-relaxed">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>
      <div className={mode === "cv_upload" ? "" : "hidden"}>{cvBlock}</div>
      <div className={mode === "template" ? "" : "hidden"}>{templateBlock}</div>
    </>
  );
}
