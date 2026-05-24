import { Hero } from "@/components/Hero";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function InformationPage({
  params,
}: {
  params: { slug: string };
}) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();
  if (!tenant.pages.information.visible) notFound();

  const sections = tenant.pages.information.sections;
  const c = tenant.company;

  return (
    <>
      <Hero />
      <section className="info-section w-full bg-white" style={{ padding: "64px 0" }}>
        <div className="container-app">
          <div
            className="info-wrapper panel-gradient flex items-start gap-8 relative"
            style={{ borderRadius: 18, padding: "60px 32px 32px" }}
          >
            <div
              className="info-card relative bg-white flex-1 min-w-0"
              style={{ borderRadius: 10, padding: "48px 32px" }}
            >
              <div
                className="info-quote-badge absolute flex items-center justify-center"
                aria-hidden="true"
                style={{
                  top: -31,
                  left: 32,
                  width: 64,
                  height: 64,
                  borderRadius: 99,
                  background:
                    "linear-gradient(to bottom, var(--primary-hover), color-mix(in srgb, var(--primary) 50%, transparent) 112.68%)",
                  boxShadow: "0 6px 20px rgba(26,61,150,.3)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden>
                  <path d="M9.6 4.8c-2.6 1.4-4.6 4.1-4.6 8.4v6h6V13H8c0-2.6 1.6-4.1 3.2-4.9L9.6 4.8Zm9 0c-2.6 1.4-4.6 4.1-4.6 8.4v6h6V13H17c0-2.6 1.6-4.1 3.2-4.9L18.6 4.8Z" />
                </svg>
              </div>

              <div
                className="info-text text-dark-3"
                style={{ fontSize: 17, lineHeight: 1.6, letterSpacing: "-0.3px" }}
              >
                {sections.length === 0 ? (
                  <p>No content yet. Add sections in the admin page.</p>
                ) : (
                  sections.map((s, i) => (
                    <div key={i} style={{ marginTop: i === 0 ? 0 : 14 }}>
                      {s.title && (
                        <p style={{ marginBottom: 6 }}>
                          <strong>{s.title}</strong>
                        </p>
                      )}
                      <p>{s.body}</p>
                    </div>
                  ))
                )}
                <div className="info-meta" style={{ marginTop: 20 }}>
                  {c.sizeRange && (
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7 }}>
                      Company size: <strong>{c.sizeRange}</strong>
                    </p>
                  )}
                  {c.headquarter && (
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7 }}>
                      Headquarter: <strong>{c.headquarter}</strong>
                    </p>
                  )}
                  {c.representativeOffices && (
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7 }}>
                      Representative offices: {c.representativeOffices}
                    </p>
                  )}
                  {c.mainClients && (
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7 }}>
                      Main clients: {c.mainClients}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
              className="info-visual overflow-hidden"
              aria-hidden="true"
              style={{
                flex: "0 0 438px",
                height: 438,
                borderRadius: 10,
                position: "sticky",
                top: "calc(var(--header-h) + 24px)",
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--hero-grad-2) 60%, color-mix(in srgb, var(--primary-tint) 70%, white) 100%)",
              }}
            >
              <div className="w-full h-full grid place-items-center text-white">
                <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" aria-hidden>
                  <path d="M3 7l9-4 9 4-9 4-9-4Z" />
                  <path d="M3 12l9 4 9-4" />
                  <path d="M3 17l9 4 9-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
