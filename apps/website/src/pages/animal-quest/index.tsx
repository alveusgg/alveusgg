import { type NextPage } from "next";
import Image from "next/image";
import { useMemo } from "react";

import {
  getClassification,
  sortAmbassadorClassification,
} from "@alveusgg/data/build/ambassadors/classification";
import ambassadors, {
  type AmbassadorKey,
} from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorKey } from "@alveusgg/data/build/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";
import animalQuest, {
  type AnimalQuestWithEpisode,
} from "@alveusgg/data/build/animal-quest";

import { classes } from "@/utils/classes";
import { formatDateTime } from "@/utils/datetime";
import { convertToSlug } from "@/utils/slugs";
import { camelToKebab, sentenceToKebab } from "@/utils/string-case";

import useGrouped, { type GroupedItems, type Options } from "@/hooks/grouped";

import Grouped, { type GroupedProps } from "@/components/content/Grouped";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import List from "@/components/content/List";
import Meta from "@/components/content/Meta";
import RssLink from "@/components/content/RssLink";
import Section from "@/components/content/Section";
import Select from "@/components/content/Select";
import SubNav from "@/components/content/SubNav";

import IconYouTube from "@/icons/IconYouTube";

import animalQuestFull from "@/assets/animal-quest/full.png";
import animalQuestLogo from "@/assets/animal-quest/logo.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

const animalQuestEpisodes: AnimalQuestWithEpisode[] = animalQuest
  .map((episode, idx) => ({
    ...episode,
    episode: idx + 1,
  }))
  .reverse();

// Allow the user to sort/group by different options
const sortByOptions = {
  all: {
    label: "All Episodes",
    sort: (episodes) => episodes,
  },
  classification: {
    label: "Ambassador Classification",
    sort: (episodes) =>
      [...episodes]
        .map(
          (episode) =>
            [episode, ambassadors[episode.ambassadors.featured[0]]] as const,
        )
        .sort(([episodeA, ambassadorA], [episodeB, ambassadorB]) => {
          const speciesA = getSpecies(ambassadorA.species);
          const speciesB = getSpecies(ambassadorB.species);

          return (
            sortAmbassadorClassification(speciesA.class, speciesB.class) ||
            episodeB.episode - episodeA.episode
          );
        })
        .reduce<GroupedItems<AnimalQuestWithEpisode>>(
          (map, [episode, ambassador]) => {
            const species = getSpecies(ambassador.species);
            const classification = getClassification(species.class);
            const group = convertToSlug(classification);

            map.set(group, {
              name: classification,
              items: [...(map.get(group)?.items || []), episode],
            });
            return map;
          },
          new Map(),
        ),
  },
  broadcast: {
    label: "Broadcast Date",
    sort: (episodes) =>
      [...episodes]
        .sort((a, b) => b.broadcast.getTime() - a.broadcast.getTime())
        .reduce<GroupedItems<AnimalQuestWithEpisode>>((map, episode) => {
          const year = episode.broadcast.getUTCFullYear().toString();

          map.set(year, {
            name: year,
            items: [...(map.get(year)?.items || []), episode],
          });
          return map;
        }, new Map()),
  },
} as const satisfies Options<AnimalQuestWithEpisode>;

const AnimalQuestItems = ({
  items,
  option,
  group,
  name,
  ref,
}: GroupedProps<AnimalQuestWithEpisode, HTMLDivElement>) => (
  <>
    {name && (
      <Heading
        level={2}
        className="mt-16 border-b-2 border-alveus-green-300/25 pb-2 text-4xl text-alveus-green-800"
        id={`${option}:${group}`}
        link
      >
        {name}
      </Heading>
    )}
    <div
      ref={ref}
      className={classes("flex flex-wrap", !group && "justify-center")}
    >
      {items.map((episode) => (
        <div
          key={episode.episode}
          className="flex basis-full items-center gap-4 py-8 md:px-8 lg:gap-8 xl:basis-1/2"
        >
          <Link
            href={`/animal-quest/${sentenceToKebab(episode.edition)}`}
            className="group relative order-last shrink-0 rounded-full bg-alveus-tan transition-transform hover:scale-102 lg:order-first"
            custom
          >
            {(() => {
              const img =
                episode.ambassadors.featured.length > 0 &&
                getAmbassadorImages(
                  episode.ambassadors.featured[0] as AmbassadorKey,
                )[0];
              return (
                <Image
                  src={img ? img.src : animalQuestFull}
                  alt={img ? img.alt : "Animal Quest"}
                  className={classes(
                    !img && "opacity-10",
                    "hidden h-24 w-24 rounded-full object-cover shadow-sm transition-shadow group-hover:shadow-md min-[430px]:block md:h-32 md:w-32",
                  )}
                  width={256}
                  style={{ objectPosition: img ? img.position : undefined }}
                />
              );
            })()}

            {episode.ambassadors.featured.length > 1 &&
              (() => {
                const img = getAmbassadorImages(
                  episode.ambassadors.featured[
                    episode.ambassadors.featured.length > 2 ? 2 : 1
                  ] as AmbassadorKey,
                )[0];
                return (
                  <Image
                    src={img.src}
                    alt={img.alt}
                    className="absolute -right-2 -bottom-2 hidden size-12 rounded-full object-cover shadow-[-10px_-10px_25px_-10px_rgba(0,0,0,0.5)] min-[430px]:block md:size-16"
                    width={256}
                    style={{ objectPosition: img.position }}
                  />
                );
              })()}

            {episode.ambassadors.featured.length > 2 &&
              (() => {
                const img = getAmbassadorImages(
                  episode.ambassadors.featured[1] as AmbassadorKey,
                )[0];
                return (
                  <Image
                    src={img.src}
                    alt={img.alt}
                    className="absolute -bottom-2 -left-2 hidden size-12 rounded-full object-cover shadow-[10px_-10px_25px_-10px_rgba(0,0,0,0.5)] min-[430px]:block md:size-16"
                    width={256}
                    style={{ objectPosition: img.position }}
                  />
                );
              })()}
          </Link>

          <div className="grow">
            <Link
              href={`/animal-quest/${sentenceToKebab(episode.edition)}`}
              className="group flex items-start justify-between gap-x-8 transition-colors hover:text-alveus-green-600"
              custom
            >
              <Heading
                level={group ? 3 : 2}
                className="my-0 mb-1.5 scroll-mt-4"
                id={sentenceToKebab(episode.edition).replace(/-edition$/, "")}
              >
                <span className="flex items-center gap-2 text-lg">
                  <IconYouTube size={24} className="lg:hidden" />
                  Episode {episode.episode}:{" "}
                </span>
                <span className="block group-hover:underline">
                  {episode.edition}
                </span>
              </Heading>

              <IconYouTube
                size={48}
                className="mt-6 hidden shrink-0 lg:block"
              />
            </Link>
            <p className="text-lg">
              <span className="text-base opacity-80">Broadcast: </span>
              {formatDateTime(episode.broadcast, { style: "long" })}
            </p>
            {episode.ambassadors.featured.length > 0 && (
              <p className="text-lg">
                <span className="text-base opacity-80">Featuring: </span>
                <List
                  items={episode.ambassadors.featured.map((ambassador) =>
                    // Retired ambassadors don't have pages
                    isActiveAmbassadorKey(ambassador) ? (
                      <Link
                        key={ambassador}
                        href={`/ambassadors/${camelToKebab(ambassador)}`}
                      >
                        {ambassadors[ambassador].name}
                      </Link>
                    ) : (
                      ambassadors[ambassador].name
                    ),
                  )}
                />
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </>
);

const AnimalQuestPage: NextPage = () => {
  const { option, group, result, update, dropdown } = useGrouped({
    items: animalQuestEpisodes,
    options: sortByOptions,
    initial: "all",
  });

  const sectionLinks = useMemo(
    () =>
      result instanceof Map
        ? [...result.entries()].map(([key, value]) => ({
            name: value.name,
            href: `#${option}:${key}`,
          }))
        : [],

    [result, option],
  );

  return (
    <>
      <Meta
        title="Animal Quest"
        description="Learn about the ambassadors at Alveus through Animal Quest, a series hosted by Maya Higa."
        image={animalQuestFull.src}
      >
        <RssLink
          title="Alveus Sanctuary Animal Quest Episodes"
          path="/feeds/animal-quest.xml"
        />
      </Meta>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-10 left-0 z-30 hidden h-auto w-1/2 max-w-36 -scale-y-100 rotate-[20deg] drop-shadow-md select-none lg:block"
        />

        <Section
          dark
          className="py-0"
          containerClassName="flex flex-wrap-reverse items-center justify-between"
        >
          <div className="w-full pt-4 pb-16 md:w-3/5 md:py-24">
            <Heading>Animal Quest</Heading>
            <p className="text-lg">
              Learn about the ambassadors at Alveus through Animal Quest, a
              series hosted by Maya Higa. Each episode introduces you to a new
              ambassador and their species&apos; importance to the environment,
              the risks they face, and what you can do to help them.
            </p>
          </div>

          <Image
            src={animalQuestLogo}
            width={576}
            alt=""
            className="mx-auto w-full max-w-xl p-4 pt-8 md:mx-0 md:w-2/5 md:pt-4"
          />
        </Section>
      </div>

      {sectionLinks.length !== 0 && (
        <SubNav links={sectionLinks} className="z-20" />
      )}

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-bottom-48 2xl:max-w-48"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-60 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-bottom-64 2xl:max-w-48"
        />

        <Section className="grow pt-8">
          <div
            className={classes(
              "flex flex-col items-center justify-end gap-4 md:flex-row",
              Array.isArray(result) ? "mb-4" : "-mb-4 md:-mb-12",
            )}
          >
            <Select
              options={dropdown}
              value={option}
              onChange={(val) => update(val as keyof typeof dropdown, null)}
              label={<span className="sr-only">Sort by</span>}
              align="right"
              className="shrink-0"
            />
          </div>

          <Grouped
            option={option}
            group={group}
            result={result}
            component={AnimalQuestItems}
          />
        </Section>
      </div>
    </>
  );
};

export default AnimalQuestPage;
