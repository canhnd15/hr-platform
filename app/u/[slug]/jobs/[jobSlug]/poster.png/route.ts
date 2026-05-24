import { renderJobOgImage } from "@/lib/job-og-image";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string; jobSlug: string } }
) {
  const image = await renderJobOgImage({
    tenantSlug: params.slug,
    jobSlug: params.jobSlug,
  });

  // ImageResponse is a Response — clone with a Content-Disposition header
  // so the browser treats it as a download instead of an inline image.
  const blob = await image.blob();
  return new Response(blob, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${params.jobSlug}.png"`,
      "Cache-Control": "public, max-age=600",
    },
  });
}
