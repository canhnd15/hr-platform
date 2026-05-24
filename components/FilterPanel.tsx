"use client";

import type { CategoryOption, LevelOption } from "@/lib/types";

type Props = {
  variant: "sidebar" | "modal";
  query: string;
  onQueryChange: (v: string) => void;
  locations: string[];
  selectedLocations: Set<string>;
  onLocationToggle: (loc: string | null) => void;
  selectedLevels: Set<string>;
  onLevelToggle: (level: string, checked: boolean) => void;
  selectedCategories: Set<string>;
  onCategoryToggle: (cat: string, checked: boolean) => void;
  levels: LevelOption[];
  categories: CategoryOption[];
  showLocations: boolean;
  showLevel: boolean;
  showCategory: boolean;
};

function locationLabel(loc: string) {
  return loc.split(",")[0].trim();
}

export function FilterPanel(props: Props) {
  const {
    variant,
    query,
    onQueryChange,
    locations,
    selectedLocations,
    onLocationToggle,
    selectedLevels,
    onLevelToggle,
    selectedCategories,
    onCategoryToggle,
    levels,
    categories,
    showLocations,
    showLevel,
    showCategory,
  } = props;

  const isAllLocations = selectedLocations.size === 0;
  const isAllLevels =
    selectedLevels.has("all") || selectedLevels.size === 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      {variant === "sidebar" && (
        <>
          <span className="filter-title text-base font-bold leading-snug text-dark-1">
            Filter
          </span>
          <div className="search-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="#7e8494" strokeWidth="1.8" />
              <path d="m20 20-3.5-3.5" stroke="#7e8494" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Enter type of job"
            />
          </div>
        </>
      )}

      {showLocations && (
        <>
          {variant === "sidebar" && <div className="w-full h-px bg-gray-4 shrink-0" />}
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold leading-snug text-dark-1">Locations</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`location-tag ${isAllLocations ? "active" : ""}`}
                onClick={() => onLocationToggle(null)}
              >
                All Locations
              </button>
              {locations.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  className={`location-tag ${
                    selectedLocations.has(loc) ? "active" : ""
                  }`}
                  onClick={() => onLocationToggle(loc)}
                >
                  {locationLabel(loc)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {showLevel && (
        <>
          {variant === "sidebar" && <div className="w-full h-px bg-gray-4 shrink-0" />}
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold leading-snug text-dark-1">Job Level</h3>
            <div className="flex flex-col gap-2.5">
              {levels.map((lvl) => {
                const checked =
                  lvl.value === "all"
                    ? isAllLevels
                    : selectedLevels.has(lvl.value);
                return (
                  <label key={lvl.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => onLevelToggle(lvl.value, e.target.checked)}
                    />
                    <span className="checkbox-custom" />
                    {lvl.label}
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}

      {showCategory && (
        <>
          {variant === "sidebar" && <div className="w-full h-px bg-gray-4 shrink-0" />}
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold leading-snug text-dark-1">
              Job Category
            </h3>
            <div className="flex flex-col gap-2.5">
              {categories.map((cat) => (
                <label key={cat.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(cat.value)}
                    onChange={(e) => onCategoryToggle(cat.value, e.target.checked)}
                  />
                  <span className="checkbox-custom" />
                  {cat.label}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
