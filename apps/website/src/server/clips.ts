import { prisma } from "@/server/db/client";
import { getClipDetails, getClipsByDate } from "./utils/twitch-api";

export async function removeInvalidClips() {
  const clips = await prisma.clip.findMany();
  const invalidClipSlugs = [];

  for (let i = 0; i < clips.length; i += 100) {
    const clipSlugs = clips.slice(i, i + 100).map((clip) => clip.slug);
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
      slug: {
        in: invalidClipSlugs,
      },
    },
  });
}

export async function populateClips() {
  const latestClip = await prisma.clip.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  const minutesDelay = 30;
  const minimumViews = 50;

  const startDate = new Date();
  startDate.setMinutes(startDate.getMinutes() - minutesDelay * 2);

  const endDate = new Date();
  endDate.setMinutes(endDate.getMinutes() - minutesDelay);

  let clips = undefined;
  do {
    clips = await getClipsByDate(
      "636587384",
      startDate,
      endDate,
      clips ? clips.pagination.cursor : undefined,
    );

    const clipsToAdd = [];
    for (const clip of clips.data) {
      if (clip.view_count < minimumViews) continue;

      clipsToAdd.push({
        slug: clip.id,
        title: clip.title,
        createdAt: new Date(clip.created_at),
        thumbnailUrl: clip.thumbnail_url,
        creator: clip.creator_name,
      });
    }

    await prisma.clip.createMany({
      data: clipsToAdd,
      skipDuplicates: true,
    });
  } while (clips.pagination.cursor);
}
