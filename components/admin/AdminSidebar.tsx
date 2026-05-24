"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/profile", label: "Profile", icon: "👤" },
  { href: "/admin/branding", label: "Branding", icon: "🎨" },
  { href: "/admin/filters", label: "Filters", icon: "⚙" },
  { href: "/admin/pages", label: "Pages", icon: "📝" },
  { href: "/admin/jobs", label: "Jobs", icon: "💼" },
  { href: "/admin/applications", label: "Applications", icon: "📬" },
];

export function AdminSidebar({
  tenantSlug,
  email,
}: {
  tenantSlug: string;
  email: string | null;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="w-[240px] shrink-0 bg-white border-r border-gray-4 h-[100dvh] sticky top-0 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-4 flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-2">
          Tenant
        </span>
        <Link
          href={`/u/${tenantSlug}`}
          target="_blank"
          className="text-sm font-semibold text-dark-1 hover:text-primary truncate"
          title={`Open /u/${tenantSlug} in a new tab`}
        >
          /u/{tenantSlug} ↗
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-primary text-white"
                : "text-dark-1 hover:bg-gray-5"
            }`}
          >
            <span className="w-5 text-center" aria-hidden>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <form
        action={signOutAction}
        className="px-3 py-4 border-t border-gray-4 flex flex-col gap-2"
      >
        {email && (
          <span className="text-xs text-gray-2 truncate" title={email}>
            {email}
          </span>
        )}
        <button
          type="submit"
          className="w-full text-sm font-semibold text-dark-1 hover:text-[#d70000] text-left px-3 py-2 rounded-md hover:bg-gray-5 transition-colors"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}
