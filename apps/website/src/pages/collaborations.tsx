import { forwardRef, useEffect, useState } from "react";
import { type NextPage } from "next";
import Image from "next/image";

import useGrouped, { type GroupedItems, type Options } from "@/hooks/grouped";
import useDragScroll from "@/hooks/drag";

import { formatDateTime } from "@/utils/datetime";
import { classes } from "@/utils/classes";

import collaborations, {
  type Creator,
  type Collaboration,
} from "@/data/collaborations";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";
import { Lightbox, Preview } from "@/components/content/YouTube";
import Grouped, { type GroupedProps } from "@/components/content/Grouped";

import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";

type CreatorWithSlug = Creator & { slug: string };

const creators = collaborations
  .reduce(
    (acc, { slug, creators }) => [
      ...acc,
      ...creators.map((creator) => ({
        ...creator,
        slug,
      })),
    ],
    [] as CreatorWithSlug[],
  )
  .sort((a, b) => b.popularity - a.popularity);

const Creators = ({ className }: { className?: string }) => {
  const drag = useDragScroll();

  return (
    <div className={classes("flex justify-center", className)}>
      <div className="relative isolate max-w-full">
        <ul
          className="scrollbar-none group/creators flex max-w-full cursor-grab flex-row gap-y-4 overflow-x-auto pb-2 pl-12 pr-8 pt-6"
          onMouseDown={drag}
        >
          {creators.map(({ name, image, slug }, idx) => (
            <li key={slug} style={{ zIndex: creators.length - idx }}>
              <Link
                href={`#${slug}`}
                title={name}
                custom
                className="group/creator -ml-6 block cursor-pointer select-none rounded-full transition-all duration-75 hover:-mt-4 hover:scale-105 hover:px-4 hover:pb-4"
                onClick={(e) => {
                  e.preventDefault();
                  history.pushState(null, "", `#${slug}`);
                  document.getElementById(slug)?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                draggable={false}
              >
                <div className="h-20 w-20 rounded-full border-4 border-alveus-green bg-alveus-green-800">
                  <Image
                    src={image}
                    alt=""
                    className="h-full w-full rounded-full object-cover shadow-md transition-all duration-75 group-hover/creator:shadow-lg group-hover/creator:!brightness-105 group-hover/creator:contrast-115 group-hover/creator:!saturate-110 group-has-[:hover]/creators:brightness-75 group-has-[:hover]/creators:saturate-50"
                    draggable={false}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-l from-transparent to-alveus-green"
          style={{ zIndex: creators.length + 1 }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 bottom-0 right-0 w-10 bg-gradient-to-r from-transparent to-alveus-green"
          style={{ zIndex: creators.length + 1 }}
        />
      </div>
    </div>
  );
};

const sortByOptions = {
  all: {
    label: "All Collaborations",
    sort: (collaborations) =>
      collaborations.reduce<GroupedItems<Collaboration>>(
        (map, collaboration) => {
          const year = collaboration.date.getUTCFullYear().toString();

          map.set(year, {
            name: year,
            items: [...(map.get(year)?.items || []), collaboration],
          });
          return map;
        },
        new Map(),
      ),
  },
} as const satisfies Options<Collaboration>;

const CollaborationItems = forwardRef<
  HTMLDivElement,
  GroupedProps<Collaboration>
>(({ items, option, group, name, index }, ref) => {
  const [open, setOpen] = useState<string>();
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (items.some((collaboration) => collaboration.slug === hash))
      setOpen(hash);
  }, [items]);

  return (
    <>
      {name && (
        <Heading
          level={-1}
          className={classes(
            "alveus-green-800 mb-6 mt-8 border-b-2 border-alveus-green-300/25 pb-2 text-4xl",
            index === 0 && "sr-only",
          )}
          id={`${option}:${group}`}
          link
        >
          {name}
        </Heading>
      )}
      <Lightbox
        id={`collaborations-${name}`}
        className="flex flex-wrap"
        value={open}
        onChange={setOpen}
        ref={ref}
      >
        {({ Trigger }) => (
          <>
            {items.map((collaboration) => (
              <div
                key={collaboration.slug}
                className="mx-auto flex basis-full flex-col items-center justify-start py-8 md:px-8 lg:basis-1/2"
              >
                <Heading
                  level={2}
                  className="flex flex-wrap items-end justify-center gap-x-8 gap-y-2 text-center"
                  id={collaboration.slug}
                >
                  {collaboration.link !== null ? (
                    <Link
                      href={collaboration.link}
                      className="hover:text-alveus-green-600 hover:underline"
                      external
                      custom
                    >
                      {collaboration.name}
                    </Link>
                  ) : (
                    collaboration.name
                  )}
                  <small className="text-xl text-alveus-green-600">
                    <Link href={`#${collaboration.slug}`} custom>
                      {formatDateTime(collaboration.date, { style: "long" })}
                    </Link>
                  </small>
                </Heading>

                <Trigger
                  videoId={collaboration.videoId}
                  caption={`${collaboration.name}: ${formatDateTime(
                    collaboration.date,
                    {
                      style: "long",
                    },
                  )}`}
                  triggerId={collaboration.slug}
                  className="w-full max-w-2xl"
                >
                  <Preview videoId={collaboration.videoId} />
                </Trigger>

                {collaboration.vodId && (
                  <p className="mt-2">
                    (
                    <Link
                      href={`https://www.youtube.com/watch?v=${collaboration.vodId}&list=PLtQafKoimfLd6dM9CQqiLm79khNgxsoN3`}
                      external
                    >
                      Full stream VoD
                    </Link>
                    )
                  </p>
                )}
              </div>
            ))}
          </>
        )}
      </Lightbox>
    </>
  );
});

CollaborationItems.displayName = "CollaborationItems";

const CollaborationsPage: NextPage = () => {
  const { option, group, result } = useGrouped({
    items: collaborations,
    options: sortByOptions,
    initial: "all",
  });

  return (
    <>
      <Meta
        title="Collaborations"
        description="We work with other content creators to educate our combined audiences, introducing them to the educational ambassadors at Alveus and their conservation missions."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-16 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section dark className="pb-12 pt-24">
          <div className="w-full lg:w-4/5">
            <Heading>Our Collaborations</Heading>
            <p className="text-balance text-lg">
              We work with other content creators to educate our combined
              audiences, introducing them to the educational ambassadors at
              Alveus and their conservation missions.
            </p>

            <p className="mt-2 text-balance text-lg">
              We&apos;ve hosted{" "}
              <abbr
                title={`Across ${collaborations.length.toLocaleString()} collaboration streams`}
              >
                {creators.length.toLocaleString()} creators
              </abbr>{" "}
              at the sanctuary since {collaborations.at(-1)?.date.getFullYear()}
              , bringing audiences from Twitch, YouTube, and other platforms,
              together to learn about the importance of conservation.
            </p>
          </div>

          <Creators className="mt-6" />
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-48 2xl:max-w-[12rem]"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-60 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-64 2xl:max-w-[12rem]"
        />

        <Section className="flex-grow">
          <Grouped
            option={option}
            group={group}
            result={result}
            component={CollaborationItems}
          />
        </Section>
      </div>
    </>
  );
};

export default CollaborationsPage;
