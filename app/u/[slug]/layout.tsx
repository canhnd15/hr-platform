import { notFound } from "next/navigation";
import { TenantProvider } from "@/components/TenantProvider";
import { Header } from "@/components/Header";
import { getTenantBySlug } from "@/lib/tenant";

export default async function TenantLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: React.ReactNode;
}) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();

  // For themePreset 'custom', the tenant's chosen primary color overrides the
  // CSS variable. For built-in presets, the [data-theme] selector in
  // globals.css handles everything.
  const customStyle =
    tenant.branding.themePreset === "custom"
      ? ({
          "--primary": tenant.branding.primaryColor,
        } as React.CSSProperties)
      : undefined;

  return (
    <TenantProvider value={tenant}>
      <div
        data-theme={tenant.branding.themePreset}
        style={customStyle}
        className="career-screen"
      >
        <Header />
        {children}
      </div>
    </TenantProvider>
  );
}
