import { type ComponentProps } from "react";
import Image from "next/image";
import {
  type AnimalQuestWithEpisode,
  type AnimalQuestWithRelation,
} from "@alveusgg/data/src/animal-quest";
import { type Ambassador } from "@alveusgg/data/src/ambassadors/core";

import { sentenceToKebab } from "@/utils/string-case";
import { classes } from "@/utils/classes";

import IconYouTube from "@/icons/IconYouTube";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";

import animalQuestImage from "@/assets/animal-quest/full.png";

type AnimalQuestProps = {
  episode: AnimalQuestWithEpisode;
  relation: AnimalQuestWithRelation["relation"];
  ambassador: Ambassador;
  heading?: ComponentProps<typeof Heading>["level"];
  className?: string;
};

const AnimalQuest = ({
  episode,
  relation,
  ambassador,
  heading = 2,
  className,
}: AnimalQuestProps) => (
  <Link
    href={`/animal-quest/${sentenceToKebab(episode.edition)}`}
    className={classes(
      "group relative z-0 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 rounded-2xl bg-alveus-tan px-6 py-4 shadow-xl transition hover:scale-102 hover:shadow-2xl sm:flex-nowrap md:flex-wrap xl:flex-nowrap dark:bg-alveus-green",
      className,
    )}
    custom
  >
    <Image
      src={animalQuestImage}
      alt=""
      width={688}
      className="absolute inset-0 -z-10 h-full w-full rounded-2xl bg-alveus-tan object-cover opacity-10 dark:bg-alveus-green"
    />

    <div className="text-alveus-green-900 transition-colors group-hover:text-alveus-green-800 dark:text-alveus-tan dark:group-hover:text-alveus-green-200">
      <Heading level={heading}>
        <span className="inline-block">
          <span className="inline-block">Animal Quest</span>{" "}
          <span className="inline-block">#{episode.episode}:</span>
        </span>{" "}
        <span className="inline-block">{episode.edition}</span>
      </Heading>
      <p className="text-balance text-xl opacity-90">
        <span className="inline-block">
          Learn more {relation === "featured" && `about ${ambassador.name} `}
          on
        </span>{" "}
        <span className="inline-block">Animal Quest</span>
      </p>
    </div>

    <IconYouTube
      size={48}
      className="shrink-0 text-alveus-green-900 transition-colors group-hover:text-alveus-green-600 dark:text-alveus-tan dark:group-hover:text-alveus-green-400"
    />
  </Link>
);

export default AnimalQuest;
