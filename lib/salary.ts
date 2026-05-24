import type { Currency } from "@/lib/types";

export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: Currency | null | undefined,
  fallback?: string | null
): string {
  if (min == null && max == null) return fallback ?? "";

  const fmt = (n: number) =>
    currency === "VND"
      ? n.toLocaleString("vi-VN")
      : "$" + n.toLocaleString("en-US");
  const suffix = currency === "VND" ? " VND" : "";

  if (min != null && max != null) return `${fmt(min)} - ${fmt(max)}${suffix}`;
  if (min != null) return `from ${fmt(min)}${suffix}`;
  if (max != null) return `up to ${fmt(max)}${suffix}`;
  return fallback ?? "";
}
