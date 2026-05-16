import Image from "next/image";
import { type ComponentProps } from "react";

import ambassadors, {
  type AmbassadorKey,
} from "@alveusgg/data/build/ambassadors/core";
import { type AnimalQuestWithEpisode } from "@alveusgg/data/build/animal-quest";

import { classes } from "@/utils/classes";
import { sentenceToKebab } from "@/utils/string-case";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";

import IconYouTube from "@/icons/IconYouTube";

import animalQuestImage from "@/assets/animal-quest/full.png";

import List from "./List";

type AnimalQuestProps = {
  episode: AnimalQuestWithEpisode;
  ambassador?: AmbassadorKey;
  heading?: ComponentProps<typeof Heading>["level"];
  className?: string;
};

const AnimalQuest = ({
  episode,
  ambassador,
  heading = 2,
  className,
}: AnimalQuestProps) => (
  <Link
    href={`/animal-quest/${sentenceToKebab(episode.edition)}`}
    className={classes(
      "group relative z-0 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 rounded-2xl bg-alveus-tan px-6 py-4 shadow-xl transition hover:scale-102 hover:shadow-2xl sm:flex-nowrap md:flex-wrap xl:flex-nowrap",
      className,
    )}
    custom
  >
    <Image
      src={animalQuestImage}
      alt=""
      width={688}
      className="absolute inset-0 -z-10 size-full rounded-2xl bg-alveus-tan object-cover opacity-10"
    />

    <div>
      <Heading
        level={heading}
        className="text-alveus-green-900 transition-colors group-hover:text-alveus-green-800"
      >
        <span className="inline-block">
          <span className="inline-block">Animal Quest</span>{" "}
          <span className="inline-block">#{episode.episode}:</span>
        </span>{" "}
        <span className="inline-block">{episode.edition}</span>
      </Heading>
      <p className="text-xl text-balance text-alveus-green-800">
        <span className="inline-block">
          Learn more about{" "}
          <List
            items={(ambassador
              ? [ambassador]
              : episode.ambassadors.featured
            ).map((ambassador) => ambassadors[ambassador].name)}
          />{" "}
          on
        </span>{" "}
        <span className="inline-block">Animal Quest</span>
      </p>
    </div>

    <IconYouTube
      size={48}
      className="shrink-0 text-alveus-green-900 transition-colors group-hover:text-alveus-green-600"
    />
  </Link>
);

export default AnimalQuest;
