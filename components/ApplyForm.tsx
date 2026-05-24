"use client";

import { useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Tab = "apply" | "refer";

export function ApplyForm({
  jobTitle,
  tenantId,
  jobId,
}: {
  jobTitle: string;
  tenantId: string;
  jobId: string;
}) {
  const [tab, setTab] = useState<Tab>("apply");
  const [referrerType, setReferrerType] = useState<"SotaTeker" | "Other">(
    "Other"
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; text: string } | null
  >(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isRefer = tab === "refer";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const supabase = createSupabaseBrowserClient();

    try {
      const file = (fd.get("attachment") as File | null) ?? null;
      let cvUrl: string | null = null;
      if (file && file.size > 0) {
        const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
        const path = `${tenantId}/${jobId}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("cvs")
          .upload(path, file, {
            contentType: file.type || "application/octet-stream",
          });
        if (upErr) throw upErr;
        // Bucket is private; store the storage path. Admin signs URLs on read.
        cvUrl = path;
      }

      const { error: insErr } = await supabase.from("applications").insert({
        tenant_id: tenantId,
        job_id: jobId,
        form_type: tab,
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        candidate_name: isRefer
          ? String(fd.get("candidate_name") ?? "")
          : null,
        candidate_phone: isRefer
          ? String(fd.get("candidate_phone") ?? "")
          : null,
        candidate_email: isRefer
          ? String(fd.get("candidate_email") ?? "")
          : null,
        cv_url: cvUrl,
      });
      if (insErr) throw insErr;

      setFeedback({
        kind: "success",
        text: isRefer
          ? "Thanks for the referral — we'll be in touch."
          : "Application received — we'll be in touch shortly.",
      });
      formRef.current?.reset();
      setFileName(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed.";
      setFeedback({ kind: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="apply-card">
      <div className="apply-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`apply-tab ${tab === "apply" ? "active" : ""}`}
          onClick={() => setTab("apply")}
          aria-selected={tab === "apply"}
        >
          Apply Now
        </button>
        <button
          type="button"
          role="tab"
          className={`apply-tab ${tab === "refer" ? "active" : ""}`}
          onClick={() => setTab("refer")}
          aria-selected={tab === "refer"}
        >
          Refer a friend
        </button>
      </div>

      <div className="apply-heading">
        <h3>
          {isRefer
            ? "Know someone perfect for this role?"
            : "Are you ready to start your career with us?"}
        </h3>
        <p>
          {isRefer
            ? "Send us their details and we'll take it from there."
            : "Please leave us your information to apply"}
        </p>
      </div>

      <form
        ref={formRef}
        className={`apply-form ${isRefer ? "mode-refer" : ""}`}
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="job_title" value={jobTitle} />
        <input type="hidden" name="form_type" value={tab} />
        {isRefer && (
          <input type="hidden" name="referrer_type" value={referrerType} />
        )}

        <div className="apply-form-fields">
          <div className="refer-only refer-you-are">
            <span className="refer-label">You are</span>
            <label className="refer-check">
              <input
                type="checkbox"
                checked={referrerType === "SotaTeker"}
                onChange={() => setReferrerType("SotaTeker")}
              />
              <span className="refer-check-box" />
              Insider
            </label>
            <label className="refer-check">
              <input
                type="checkbox"
                checked={referrerType === "Other"}
                onChange={() => setReferrerType("Other")}
              />
              <span className="refer-check-box" />
              Other
            </label>
          </div>

          <div className="apply-row">
            <input
              className="apply-input"
              type="text"
              name="name"
              placeholder="Your name *"
              required
            />
            <input
              className="apply-input"
              type="tel"
              name="phone"
              placeholder="Your phone *"
              required
            />
          </div>
          <div className="apply-row">
            <input
              className="apply-input"
              type="email"
              name="email"
              placeholder="Your Email *"
              required
            />
          </div>

          <div className="refer-only refer-candidate">
            <div className="apply-row">
              <input
                className="apply-input"
                type="text"
                name="candidate_name"
                placeholder="Candidate's Full Name *"
                required={isRefer}
              />
              <input
                className="apply-input"
                type="tel"
                name="candidate_phone"
                placeholder="Candidate's Phone *"
                required={isRefer}
              />
            </div>
            <div className="apply-row">
              <input
                className="apply-input"
                type="email"
                name="candidate_email"
                placeholder="Candidate's Email *"
                required={isRefer}
              />
            </div>
          </div>

          <label className="apply-upload">
            <svg
              width="20"
              height="25"
              viewBox="0 0 20 25"
              fill="none"
              stroke="#036ae5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 1H3a2 2 0 00-2 2v19a2 2 0 002 2h14a2 2 0 002-2V8l-7-7z" />
              <path d="M12 1v7h7M6 15l4-4 4 4M10 11v8" />
            </svg>
            <span className="apply-upload-text">
              {fileName ? (
                <>
                  <strong>{fileName}</strong> — Click to change
                </>
              ) : (
                <>
                  Drag and Drop here or <strong>Browse files</strong>
                </>
              )}
            </span>
            <input
              type="file"
              name="attachment"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={(e) =>
                setFileName(e.target.files?.[0]?.name ?? null)
              }
            />
          </label>
        </div>

        {feedback && (
          <p
            role="status"
            className={`text-sm w-full text-center ${
              feedback.kind === "success" ? "text-positive" : "text-[#d70000]"
            }`}
          >
            {feedback.text}
          </p>
        )}

        <button
          type="submit"
          className="apply-submit"
          disabled={submitting}
        >
          {submitting ? "Submitting…" : isRefer ? "Refer" : "Apply"}
        </button>
      </form>
    </div>
  );
}
