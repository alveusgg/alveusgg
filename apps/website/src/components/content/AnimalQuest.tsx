import { type ComponentProps } from "react";
import Image from "next/image";

import { sentenceToKebab } from "@/utils/string-case";
import { classes } from "@/utils/classes";

import IconYouTube from "@/icons/IconYouTube";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";

import animalQuestImage from "@/assets/animal-quest/full.png";
import { type Ambassador } from "../../../../../../data/src/ambassadors/core";
import {
  type AnimalQuestWithEpisode,
  type AnimalQuestWithRelation,
} from "../../../../../../data/src/animal-quest";

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
      <p className="text-balance text-xl text-alveus-green-800">
        <span className="inline-block">
          Learn more {relation === "featured" && `about ${ambassador.name} `}
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
