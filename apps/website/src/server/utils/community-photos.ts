import { z } from "zod";

import { env } from "@/env";

import invariant from "@/utils/invariant";

const responseSchema = z.object({
  url: z.string().url(),
});

export async function generatePreSignedUploadUrl(username: string) {
  invariant(env.COMMUNITY_PHOTOS_URL, "Missing COMMUNITY_PHOTOS_URL");

  const url = new URL(env.COMMUNITY_PHOTOS_URL);
  url.pathname = "/presign";
  url.searchParams.set("username", username);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `ApiKey ${env.COMMUNITY_PHOTOS_KEY}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to get presigned upload url", response.status);
      return null;
    }

    return responseSchema.parse(await response.json()).url;
  } catch (e) {
    console.error(e);
    return null;
  }
}
