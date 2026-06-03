import type { FC } from "react";

import animalQuestEpisodes from "@alveusgg/data/build/animal-quest";

import AnimalQuest from "@/components/content/AnimalQuest";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";

import type { AnimalQuestTeaserData } from "./types";

// The "latest" episode is computed (not editorial), so it's resolved here, not from JSON.
const latestAnimalQuest = animalQuestEpisodes.toSorted(
  (a, b) => b.broadcast.getTime() - a.broadcast.getTime(),
)[0];

export const AnimalQuestTeaser: FC<{ data: AnimalQuestTeaserData }> = ({
  data,
}) => (
  <Section dark>
    <div className="flex flex-wrap items-center gap-y-8">
      <div className="basis-full lg:basis-1/3 xl:basis-1/2">
        <Heading level={2} id="animal-quest" link>
          {data.heading}
        </Heading>
        <p className="my-4 text-lg">{data.body}</p>
        <Button href={data.cta.href} dark>
          {data.cta.label}
        </Button>
      </div>

      {latestAnimalQuest && (
        <div className="basis-full lg:basis-2/3 lg:px-16 xl:basis-1/2">
          <Heading
            level={3}
            className="my-1 font-sans text-lg font-normal text-alveus-green-100 uppercase"
          >
            {data.latestLabel}
          </Heading>

          <AnimalQuest episode={latestAnimalQuest} heading={-1} />
        </div>
      )}
    </div>
  </Section>
);
