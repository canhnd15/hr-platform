"use client";

import { useEffect, useMemo, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { FilterPanel } from "@/components/FilterPanel";
import { useTenant } from "@/components/TenantProvider";
import type { Job } from "@/lib/types";

export function JobsList({ jobs }: { jobs: Job[] }) {
  const tenant = useTenant();
  const { ui } = tenant;

  const [query, setQuery] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(
    new Set()
  );
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [modalOpen, setModalOpen] = useState(false);

  const locations = useMemo(() => {
    if (ui.locations.length > 0) return ui.locations;
    const set = new Set<string>();
    jobs.forEach((j) => j.location && set.add(j.location));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [jobs, ui.locations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (
        q &&
        !(
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q)
        )
      )
        return false;
      if (selectedLocations.size > 0 && !selectedLocations.has(job.location))
        return false;
      const hasLevel =
        selectedLevels.size > 0 && !selectedLevels.has("all");
      if (
        hasLevel &&
        !selectedLevels.has((job.level || "").toLowerCase())
      )
        return false;
      if (selectedCategories.size > 0) {
        const company = (job.company || "").toLowerCase();
        const match = [...selectedCategories].some((catVal) => {
          const cat = ui.categories.find((c) => c.value === catVal);
          return cat ? company.includes(cat.keyword.toLowerCase()) : false;
        });
        if (!match) return false;
      }
      return true;
    });
  }, [jobs, query, selectedLocations, selectedLevels, selectedCategories, ui.categories]);

  const handleLocationToggle = (loc: string | null) => {
    setSelectedLocations((prev) => {
      if (loc === null) return new Set();
      const next = new Set(prev);
      if (next.has(loc)) next.delete(loc);
      else next.add(loc);
      return next;
    });
  };

  const handleLevelToggle = (value: string, checked: boolean) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (value === "all") {
        next.clear();
        if (checked) next.add("all");
      } else {
        next.delete("all");
        if (checked) next.add(value);
        else next.delete(value);
      }
      return next;
    });
  };

  const handleCategoryToggle = (value: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (checked) next.add(value);
      else next.delete(value);
      return next;
    });
  };

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const panelProps = {
    query,
    onQueryChange: setQuery,
    locations,
    selectedLocations,
    onLocationToggle: handleLocationToggle,
    selectedLevels,
    onLevelToggle: handleLevelToggle,
    selectedCategories,
    onCategoryToggle: handleCategoryToggle,
    levels: ui.levels,
    categories: ui.categories,
    showLocations: ui.showLocationsFilter,
    showLevel: ui.showLevelFilter,
    showCategory: ui.showCategoryFilter,
  };

  const anyFilter =
    ui.showLocationsFilter || ui.showLevelFilter || ui.showCategoryFilter;

  return (
    <>
      <section className="jobs-section w-full bg-white relative z-10 jobs-padding">
        <div className="container-app flex items-start gap-6 jobs-container">
          {anyFilter && (
            <div className="mobile-filter-bar w-full flex-col gap-3 hidden">
              <div className="search-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="11" cy="11" r="7" stroke="#7e8494" strokeWidth="1.8" />
                  <path d="m20 20-3.5-3.5" stroke="#7e8494" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter type of job"
                />
              </div>
              <button
                type="button"
                className="flex items-center justify-center gap-4 bg-gray-4 hover:bg-[#d1d4e0] border-none rounded-3xl w-full text-dark-1 font-semibold transition-colors"
                style={{ padding: "8px 16px", fontSize: 14, lineHeight: 1.4 }}
                onClick={() => setModalOpen(true)}
              >
                Filter Search
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="20" y2="12" />
                  <line x1="12" y1="18" x2="20" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {anyFilter && (
            <aside
              className="filter-sidebar shrink-0 self-start flex flex-col gap-4 bg-white"
              style={{
                width: "clamp(220px, 19.86vw, 286px)",
                border: "1px solid #e5e7ef",
                borderRadius: 8,
                padding: "16px 16px 24px",
                position: "sticky",
                top: "calc(var(--header-h) + 16px)",
              }}
            >
              <FilterPanel variant="sidebar" {...panelProps} />
            </aside>
          )}

          <div
            className="jobs-grid flex-1 grid gap-[clamp(16px,1.67vw,24px)] min-w-0"
            style={{
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              alignContent: "start",
            }}
          >
            {filtered.length === 0 ? (
              <div className="col-span-full flex flex-col items-center py-8 px-4 w-full">
                <p className="text-gray-2 text-sm text-center leading-loose max-w-[320px]">
                  No matching jobs at the moment. Try clearing some filters.
                </p>
              </div>
            ) : (
              filtered.map((j) => (
                <JobCard key={j.id} job={j} tenantSlug={tenant.slug} />
              ))
            )}
          </div>
        </div>
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-modal w-[343px] max-w-full max-h-[90dvh] overflow-y-auto flex flex-col"
            style={{ border: "1px solid #e6e8ec" }}
          >
            <div className="flex items-center justify-between" style={{ padding: "16px 9px 12px 16px" }}>
              <h2 className="font-semibold text-dark-1" style={{ fontSize: 20, lineHeight: 1.3, letterSpacing: "-0.2px" }}>
                Filter Search
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close filter"
                className="w-5 h-5 border-none bg-transparent flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="#101624" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="px-4 pb-5 overflow-y-auto">
              <FilterPanel variant="modal" {...panelProps} />
            </div>
            <div className="flex gap-4 px-4 pb-4">
              <button
                className="flex-1 border-none rounded font-semibold transition-colors hover:bg-[#d1d4e0]"
                style={{ padding: 10, fontSize: 14, lineHeight: 1.4, background: "#e5e7ef", color: "#101624" }}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 border-none rounded text-white font-semibold transition-colors"
                style={{ padding: 10, fontSize: 14, lineHeight: 1.4, background: "var(--primary)" }}
                onClick={() => setModalOpen(false)}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
