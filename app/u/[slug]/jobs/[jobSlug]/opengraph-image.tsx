import { OG_CONTENT_TYPE, OG_SIZE, renderJobOgImage } from "@/lib/job-og-image";

export const runtime = "nodejs";
export const alt = "Job opening";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: { slug: string; jobSlug: string };
}) {
  return renderJobOgImage({
    tenantSlug: params.slug,
    jobSlug: params.jobSlug,
  });
}
