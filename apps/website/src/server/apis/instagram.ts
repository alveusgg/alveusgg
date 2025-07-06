import type { IncomingMessage } from "node:http";
import { get } from "node:https";

export const fetchInstagramThumbnail = async (
  postId: string,
): Promise<string> => {
  // Per https://developers.facebook.com/blog/post/2025/04/08/oembed-updates/ ...
  // "we recommend that developers generate their own thumbnails by accessing the HTML metadata directly from the Instagram post"
  // Raw request with node:https to avoid the Sec-Fetch-Mode header from `fetch` which Instagram doesn't like
  const resp = await new Promise<IncomingMessage>((resolve, reject) =>
    get(
      `https://www.instagram.com/p/${encodeURIComponent(postId)}/embed/`,
      {
        headers: {
          "User-Agent": "alveus.gg",
        },
      },
      resolve,
    ).on("error", reject),
  );
  if (!resp.statusCode || resp.statusCode < 200 || resp.statusCode >= 300) {
    resp.resume();
    throw new Error(`Failed to fetch Instagram post: ${resp.statusCode}`);
  }

  const html = await new Promise<string>((resolve, reject) => {
    resp.setEncoding("utf8");

    let data = "";
    resp.on("data", (chunk) => {
      data += chunk.toString();
    });

    resp.on("end", () => resolve(data));
    resp.on("error", (err) => reject(err));
  });

  // Look for an image in the HTML with the class "EmbeddedMediaImage"
  // There's also "display_url" and "display_src" in JSON data that could be used instead
  const image = html.match(
    /<img\s+[^>]*class="EmbeddedMediaImage"\s+[^>]*src="([^"]+)"/,
  )?.[1];
  if (!image) {
    throw new Error("No image found in Instagram post");
  }

  return image.replace(/&amp;/g, "&");
};
