import { ImageResponse } from "next/og";
import { getJobBySlugForTenant, getTenantBySlug } from "@/lib/tenant";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

const PRESET_PRIMARY: Record<string, string> = {
  kim: "#b58a3b",
  moc: "#2f8a4d",
  thuy: "#036ae5",
  hoa: "#d33b3b",
  tho: "#a06b32",
  custom: "#036ae5",
};

function tenantPrimary(themePreset: string, primaryColor: string): string {
  if (themePreset === "custom") return primaryColor || "#036ae5";
  return PRESET_PRIMARY[themePreset] ?? "#036ae5";
}

function darken(hex: string, amount = 0.18): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const v = parseInt(m[1], 16);
  const r = Math.max(0, ((v >> 16) & 0xff) * (1 - amount));
  const g = Math.max(0, ((v >> 8) & 0xff) * (1 - amount));
  const b = Math.max(0, (v & 0xff) * (1 - amount));
  const to2 = (n: number) =>
    Math.round(n).toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

export async function renderJobOgImage({
  tenantSlug,
  jobSlug,
}: {
  tenantSlug: string;
  jobSlug: string;
}): Promise<ImageResponse> {
  const tenant = await getTenantBySlug(tenantSlug);
  const job = tenant ? await getJobBySlugForTenant(tenant.id, jobSlug) : null;

  const companyName = tenant?.company.name ?? "Tenant";
  const initial = (companyName || "T").charAt(0).toUpperCase();
  const primary = tenant
    ? tenantPrimary(tenant.branding.themePreset, tenant.branding.primaryColor)
    : "#036ae5";
  const primaryDeep = darken(primary, 0.25);

  const title = job?.title ?? "Open role";
  const level = job?.level ?? "";
  const type = job?.type ?? "";
  const locationType = job?.locationType ?? "";
  const location = job?.location ?? "";
  const salary = job?.salary ?? "";

  const chips = [level, type, locationType, location].filter(Boolean);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          background: `linear-gradient(135deg, ${primary} 0%, ${primaryDeep} 100%)`,
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top row: company badge + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            {initial}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              opacity: 0.92,
              letterSpacing: -0.3,
            }}
          >
            {companyName}
          </div>
        </div>

        {/* Middle: title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingRight: 40,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>
          {salary && (
            <div
              style={{
                marginTop: 24,
                fontSize: 36,
                fontWeight: 700,
                color: "rgba(255,255,255,0.95)",
              }}
            >
              {salary}
            </div>
          )}
        </div>

        {/* Bottom: chips + footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {chips.map((c) => (
              <div
                key={c}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  borderRadius: 999,
                  padding: "10px 22px",
                  fontSize: 26,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {c}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 22,
              opacity: 0.85,
              letterSpacing: 0.2,
              display: "flex",
            }}
          >
            /u/{tenantSlug}/jobs/{jobSlug}
          </div>
        </div>
      </div>
    ),
    {
      width: OG_SIZE.width,
      height: OG_SIZE.height,
    }
  );
}
