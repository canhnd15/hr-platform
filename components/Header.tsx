"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTenant } from "@/components/TenantProvider";

export function Header() {
  const tenant = useTenant();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const base = `/u/${tenant.slug}`;
  const navItems = tenant.nav.filter((n) => n.enabled);
  const isActive = (href: string) => {
    const full = href === "/" ? base : `${base}${href}`;
    return href === "/" ? pathname === base : pathname.startsWith(full);
  };

  const companyInitial = (tenant.company.name || "T").charAt(0).toUpperCase();
  const companyName = tenant.company.name || "Tenant";

  return (
    <>
      <header
        className="fixed top-0 left-0 z-[200] w-full flex items-center justify-between gap-4 border-b border-white/30 bg-white/[0.82] backdrop-blur-xl"
        style={{
          height: "var(--header-h)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.03)",
          padding: "0 30px",
        }}
      >
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`hamburger lg:hidden flex-col justify-center items-center gap-[5px] w-5 h-5 p-1 rounded-lg shrink-0 ${
            open ? "is-open" : ""
          }`}
          style={{ display: "none" }}
        >
          <span className="block bg-dark-1 rounded-[2px] transition-all" />
          <span className="block bg-dark-1 rounded-[2px] transition-all" />
          <span className="block bg-dark-1 rounded-[2px] transition-all" />
        </button>

        <Link
          href={base}
          className="header-logo shrink-0 flex items-center"
          aria-label={companyName}
        >
          {tenant.branding.logoUrl ? (
            <img
              src={tenant.branding.logoUrl}
              alt={companyName}
              className="h-auto max-h-10 object-contain"
              style={{ width: "clamp(80px, 7.57vw, 109px)" }}
            />
          ) : (
            <svg
              viewBox="0 0 109 32"
              xmlns="http://www.w3.org/2000/svg"
              className="h-auto max-h-10 object-contain"
              style={{ width: "clamp(80px, 7.57vw, 109px)" }}
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="8" fill="var(--primary)" />
              <text
                x="16"
                y="22"
                textAnchor="middle"
                fontSize="18"
                fontWeight="700"
                fill="white"
                fontFamily="inherit"
              >
                {companyInitial}
              </text>
              <text
                x="40"
                y="22"
                fontSize="16"
                fontWeight="700"
                fill="#101624"
                fontFamily="inherit"
              >
                {companyName}
              </text>
            </svg>
          )}
        </Link>

        <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-[clamp(8px,2.22vw,32px)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href === "/" ? base : `${base}${item.href}`}
              className={`nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {tenant.profile.ctaUrl && (
            <a
              href={tenant.profile.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Book call
            </a>
          )}
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[190] transition-opacity duration-[250ms] lg:pointer-events-none ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={() => setOpen(false)}
      />
      <nav
        className="fixed top-0 z-[195] h-[100dvh] w-[260px] flex flex-col gap-1 bg-white shadow-drawer transition-[right] duration-[280ms] ease-out-quint"
        style={{
          right: open ? "0" : "-280px",
          padding: "calc(var(--header-h) + 16px) 24px 32px",
        }}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href === "/" ? base : `${base}${item.href}`}
            className={`mobile-nav-item ${isActive(item.href) ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
