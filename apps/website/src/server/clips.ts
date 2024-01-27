import { prisma } from "@/server/db/client";
import { getClipDetails } from "./utils/twitch-api";

export async function removeInvalidClips() {
  const clips = await prisma.clip.findMany();
  const invalidClipSlugs = [];

  for (let i = 0; i < clips.length; i += 100) {
    const clipSlugs = clips.slice(i, i + 100).map((clip) => clip.clipSlug);
    const details = await getClipDetails(clipSlugs);

    // invalid clips are excluded from the response
    if (details.data.length < clipSlugs.length) {
      invalidClipSlugs.push(
        ...clipSlugs.filter(
          (clipSlug) => !details.data.find((d) => d.id === clipSlug),
        ),
      );
    }
  }

  if (invalidClipSlugs.length === 0) {
    return;
  }

  console.log("Removing invalid clips:", invalidClipSlugs);

  await prisma.clip.deleteMany({
    where: {
      clipSlug: {
        in: invalidClipSlugs,
      },
    },
  });
}
