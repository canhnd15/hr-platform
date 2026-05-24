import { redirect, permanentRedirect } from "next/navigation";
import { getJobByIdForTenant, getTenantBySlug } from "@/lib/tenant";

type Props = {
  params: { slug: string };
  searchParams: { id?: string };
};

export default async function LegacyJobDetailRedirect({
  params,
  searchParams,
}: Props) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) redirect("/");

  const id = searchParams.id;
  if (!id) redirect(`/u/${params.slug}`);

  const job = await getJobByIdForTenant(tenant.id, id);
  if (!job || !job.slug) redirect(`/u/${params.slug}`);

  permanentRedirect(`/u/${params.slug}/jobs/${job.slug}`);
}
