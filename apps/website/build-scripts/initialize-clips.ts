import { prisma } from "../src/server/db/client";
import { getClipsByDate } from "../src/server/utils/twitch-api";

async function populateClips() {
  const startDate = new Date(0);
  let belowMinViews = false;

  let clips = undefined;
  do {
    clips = await getClipsByDate(
      "636587384",
      startDate,
      new Date(),
      clips ? clips.pagination.cursor : undefined,
    );

    const clipsToAdd = [];
    for (const clip of clips.data) {
      if (clip.view_count < 500) {
        // api sorts by views, so once we hit a clip with < 500 views, we can stop
        belowMinViews = true;
        break;
      }

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
  } while (clips.pagination.cursor && !belowMinViews);
}

populateClips();
