import { Hero } from "@/components/Hero";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function BenefitsPage({
  params,
}: {
  params: { slug: string };
}) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();
  if (!tenant.pages.benefits.visible) notFound();

  const groups = tenant.pages.benefits.groups;

  return (
    <>
      <Hero />
      <section className="benefits-section w-full bg-white" style={{ padding: "64px 0" }}>
        <div className="container-app">
          <div
            className="benefits-panel panel-gradient flex items-start gap-8"
            style={{ borderRadius: 18, padding: 32 }}
          >
            <div
              className="benefits-content flex-1 bg-white flex flex-col gap-5 text-dark-3"
              style={{ borderRadius: 10, padding: "24px 32px", letterSpacing: "-0.5px" }}
            >
              <h2
                className="benefits-heading font-bold m-0 text-dark-3"
                style={{ fontSize: 26, lineHeight: 1.4 }}
              >
                COMPENSATION &amp; BENEFITS
              </h2>

              {groups.length === 0 ? (
                <p>No benefit groups yet. Add them in the admin page.</p>
              ) : (
                groups.map((group, i) => (
                  <div key={i} className="benefit-group flex flex-col gap-2.5">
                    <h3
                      className="benefit-group-title font-bold m-0 text-dark-3"
                      style={{ fontSize: 21, lineHeight: 1.4 }}
                    >
                      {group.title}
                    </h3>
                    <ul
                      className="benefit-bullets m-0 flex flex-col gap-1 text-dark-3"
                      style={{ paddingLeft: 24, fontSize: 19, lineHeight: 1.4 }}
                    >
                      {group.bullets.map((b, j) => (
                        <li key={j} style={{ paddingLeft: 4 }}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <aside
              className="benefits-illustration overflow-hidden self-start"
              aria-hidden="true"
              style={{
                flex: "0 0 438px",
                height: 438,
                borderRadius: 10,
                position: "sticky",
                top: "calc(var(--header-h) + 24px)",
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 40%, var(--hero-grad-2) 100%)",
              }}
            >
              <div className="w-full h-full grid place-items-center text-white">
                <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" aria-hidden>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
                </svg>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
