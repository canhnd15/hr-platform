import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { getCurrentUserTenant } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getCurrentUserTenant();
  if (!me) redirect("/login?next=/admin");

  return (
    <ToastProvider>
      <div className="min-h-[100dvh] flex bg-canvas">
        <AdminSidebar tenantSlug={me.tenantSlug} email={me.email} />
        <main className="flex-1 min-w-0 flex flex-col">
          <header className="h-14 bg-white border-b border-gray-4 px-6 flex items-center justify-between">
            <h1 className="text-base font-semibold text-dark-1">Admin</h1>
            <Link
              href={`/u/${me.tenantSlug}`}
              target="_blank"
              className="text-sm text-primary font-semibold hover:underline"
            >
              View live site ↗
            </Link>
          </header>
          <div className="flex-1 p-6 overflow-y-auto">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
