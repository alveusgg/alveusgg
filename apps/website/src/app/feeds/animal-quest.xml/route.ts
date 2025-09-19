import animalQuest, {
  type AnimalQuestWithEpisode,
} from "@alveusgg/data/build/animal-quest";

import { env } from "@/env";

import { getRssFeedContent } from "@/utils/rss-feed";
import { camelToKebab } from "@/utils/string-case";

const animalQuestEpisodes: AnimalQuestWithEpisode[] = animalQuest
  .map((episode, idx) => ({
    ...episode,
    episode: idx + 1,
  }))
  .reverse();

export async function GET() {
  const animalQuestPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/animal-quest`;
  const latestEpisodeDate = animalQuestEpisodes[0]?.broadcast;

  const animalQuestFeedItems = animalQuestEpisodes
    .map((episode) => ({
      ...episode,
      url: `${env.NEXT_PUBLIC_BASE_URL}/animal-quest/${camelToKebab(episode.edition)}`,
    }))
    .map((episode) => ({
      title: episode.edition,
      id: episode.url,
      link: episode.url,
      description: episode.description,
      content: episode.description,
      date: new Date(episode.broadcast),
    }));

  const animalQuestFeedContent = getRssFeedContent({
    title: "Alveus Sanctuary Animal Quest Episodes",
    description: "A feed for new Animal Quest episodes",
    id: animalQuestPageUrl,
    link: animalQuestPageUrl,
    updated: latestEpisodeDate,
    items: animalQuestFeedItems,
  });

  return new Response(animalQuestFeedContent, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

export const dynamic = "force-static";
