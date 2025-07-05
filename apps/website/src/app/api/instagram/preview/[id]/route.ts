import { fetchInstagramThumbnail } from "@/server/apis/instagram";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id || /[^a-zA-Z0-9_.-]/.test(id)) {
      return new Response("Invalid Instagram post ID", { status: 400 });
    }

    const url = await fetchInstagramThumbnail(id);
    const thumbnail = await fetch(url, {
      headers: {
        "User-Agent": "alveus.gg",
      },
    });
    const contentType = thumbnail.headers.get("content-type");
    if (!thumbnail.ok || !contentType?.startsWith("image/")) {
      throw new Error(
        `Failed to fetch Instagram post: ${thumbnail.statusText}`,
      );
    }

    return new Response(thumbnail.body, {
      status: 200,
      headers: {
        // Response can be cached for 30 days
        "Cache-Control": `max-age=${60 * 60 * 24 * 30}, s-maxage=${60 * 60 * 24 * 30}, must-revalidate`,
        "X-Generated-At": new Date().toISOString(),
        "Content-Type": contentType,
      },
    });
  } catch (err) {
    console.error("Error getting Instagram thumbnail", err);
    return new Response("Instagram thumbnail not available", { status: 500 });
  }
}
