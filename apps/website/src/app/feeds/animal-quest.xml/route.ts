import { Feed } from "feed";

import animalQuest, {
  type AnimalQuestWithEpisode,
} from "@alveusgg/data/build/animal-quest";

import { env } from "@/env";

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

  const feed = new Feed({
    title: "Alveus Sanctuary Animal Quest Episodes",
    description: "A feed for new Animal Quest episodes",
    id: animalQuestPageUrl,
    link: animalQuestPageUrl,
    copyright: "Copyright 2023 Alveus Sanctuary Inc. and the Alveus.gg team",
    updated: latestEpisodeDate,
  });

  animalQuestEpisodes.forEach((episode) => {
    const episodePageUrl = `${env.NEXT_PUBLIC_BASE_URL}/animal-quest/${camelToKebab(episode.edition)}`;

    feed.addItem({
      title: episode.edition,
      id: episodePageUrl,
      link: episodePageUrl,
      description: episode.description,
      content: episode.description,
      date: new Date(episode.broadcast),
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
