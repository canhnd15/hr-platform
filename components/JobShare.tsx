"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

export function JobShare({
  jobTitle,
  tenantSlug,
  jobSlug,
}: {
  jobTitle: string;
  tenantSlug: string;
  jobSlug: string;
}) {
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const shareText = `Check out this role: ${jobTitle}`;
  const enc = encodeURIComponent;
  const links = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    x: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(shareText)}`,
    whatsapp: `https://wa.me/?text=${enc(`${shareText} ${url}`)}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard", "success");
    } catch {
      toast("Couldn't copy — long-press to copy manually", "error");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: jobTitle, text: shareText, url });
    } catch {
      // user cancelled — ignore
    }
  };

  const btn =
    "inline-flex items-center justify-center gap-2 h-10 px-3 rounded-md text-sm font-semibold border border-gray-4 bg-white text-dark-1 hover:border-primary hover:text-primary transition-colors";

  return (
    <section className="bg-white border border-gray-4 rounded-xl p-5 flex flex-col gap-3">
      <h3 className="text-base font-semibold text-dark-1">Share this job</h3>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copyLink} className={btn}>
          🔗 Copy link
        </button>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className={btn}>
            📤 Share…
          </button>
        )}
        <a
          href={`/u/${tenantSlug}/jobs/${jobSlug}/poster.png`}
          download={`${jobSlug}.png`}
          className={btn}
        >
          🖼️ Download poster
        </a>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <a
          href={links.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          className={btn}
        >
          Facebook
        </a>
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className={btn}
        >
          LinkedIn
        </a>
        <a
          href={links.x}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className={btn}
        >
          X / Twitter
        </a>
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          className={btn}
        >
          WhatsApp
        </a>
      </div>
    </section>
  );
}
