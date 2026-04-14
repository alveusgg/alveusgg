import type { Cloudflare } from "cloudflare";
import { z } from "zod";
const Meta = z.object({
  mediamtx_path: z.string(),
});
type Meta = z.infer<typeof Meta>;

export const getOrCreateLiveInput = async (
  cloudflare: Cloudflare,
  accountId: string,
  path: string,
  inputs: Cloudflare.Stream.LiveInput[],
) => {
  const input = inputs.find((input) => {
    const parsed = Meta.safeParse(input.meta);
    if (!parsed.success) return false;
    return parsed.data.mediamtx_path === path;
  });

  if (input) {
    console.log(`Found existing live input for path ${path}`);
    if (!input.uid) throw new Error("Live input UID is required");
    return await cloudflare.stream.liveInputs.get(input.uid, {
      account_id: accountId,
    });
  }
  console.log(
    `No existing live input found for path ${path}, creating new one`,
  );

  const newInput = await cloudflare.stream.liveInputs.create({
    account_id: accountId,
    recording: { mode: "off", requireSignedURLs: true },
    meta: {
      name: `${path} (dynamic)`,
      mediamtx_path: path,
    },
  });
  return newInput;
};
