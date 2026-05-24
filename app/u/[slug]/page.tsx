import { Hero } from "@/components/Hero";
import { JobsList } from "@/components/JobsList";
import { RealtimeJobs } from "@/components/RealtimeJobs";
import { getJobsByTenant, getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function TenantHomePage({
  params,
}: {
  params: { slug: string };
}) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();
  const jobs = await getJobsByTenant(tenant.id);

  return (
    <>
      <Hero />
      <JobsList jobs={jobs} />
      <RealtimeJobs tenantId={tenant.id} />
    </>
  );
}
