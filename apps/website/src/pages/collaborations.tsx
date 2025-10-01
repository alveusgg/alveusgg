import { type NextPage } from "next";
import Image from "next/image";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import collaborations, {
  type Collaboration,
  type Creator,
} from "@/data/collaborations";

import { classes } from "@/utils/classes";
import { formatDateTime } from "@/utils/datetime";

import useDragScroll from "@/hooks/drag";
import useGrouped, { type GroupedItems, type Options } from "@/hooks/grouped";

import Grouped, { type GroupedProps } from "@/components/content/Grouped";
import Heading from "@/components/content/Heading";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import SubNav from "@/components/content/SubNav";
import { YouTubeEmbed, YouTubePreview } from "@/components/content/YouTube";

import IconArrowRight from "@/icons/IconArrowRight";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

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
  const ref = useRef<HTMLUListElement>(null);
  const drag = useDragScroll();

  const [dots, setDots] = useState(0);
  const onResize = useCallback(() => {
    const elm = ref.current;
    if (!elm) return;

    // Get the visible width of the scrollable elm
    // Get the width of 1rem in pixels
    const visible = elm.clientWidth;
    const rem = parseInt(getComputedStyle(document.documentElement).fontSize);

    // Calculate the number of dots to show
    // Only ever fill 80% of the visible width
    const dot = 0.75 * rem;
    const gap = 0.5 * rem;
    const count = Math.floor((visible * 0.8) / (dot + gap));
    setDots(Math.min(count, 20));
  }, []);
  useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onResize]);

  const [bar, setBar] = useState({
    start: 0,
    width: 0,
  });
  const onScroll = useCallback(() => {
    const elm = ref.current;
    if (!elm) return;

    // Get the % of the scrollable elm that is visible
    // Use that to determine how many dots to show
    const visible = elm.clientWidth / elm.scrollWidth;
    const width = Math.ceil(dots * visible);

    // Determine how far the user has scrolled
    // Use that to determine which dots to show
    const scroll = elm.scrollLeft / (elm.scrollWidth - elm.clientWidth);
    const start = Math.floor(scroll * (dots - width));

    setBar({ start, width });
  }, [dots]);
  useEffect(() => {
    onScroll();
    window.addEventListener("resize", onScroll);
    return () => window.removeEventListener("resize", onScroll);
  }, [onScroll]);

  const [barDragging, setBarDragging] = useState(false);
  const barStart = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const onBarMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (bar.width === dots) return;
      setBarDragging(true);
      barStart.current = e.clientX;
      document.body.style.cursor = "grabbing";
    },
    [bar.width, dots],
  );
  useEffect(() => {
    if (!barDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const listElm = ref.current;
      if (!listElm) return;

      const barElm = barRef.current;
      if (!barElm) return;

      const barParent = barElm.parentElement;
      if (!barParent) return;

      // Move the list proportionally to how far the bar moved in its container
      const barDistance = e.clientX - barStart.current;
      const barWidth = barParent.scrollWidth;
      const barPercentage = barDistance / barWidth;
      const listWidth = listElm.scrollWidth;
      const listDistance = listWidth * barPercentage;

      listElm.scrollBy({ left: listDistance });
      barStart.current = e.clientX;
    };

    const onMouseUp = () => {
      setBarDragging(false);
      document.body.style.cursor = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [barDragging]);

  return (
    <div className={classes("flex justify-center", className)}>
      <div className="relative isolate max-w-full">
        <ul
          className="group/creators scrollbar-none flex max-w-full cursor-grab flex-row gap-y-4 overflow-x-auto pt-6 pr-8 pb-2 pl-12"
          onMouseDown={drag}
          onScroll={onScroll}
          ref={ref}
        >
          {creators.map(({ name, image, slug }, idx) => (
            <li
              key={`${slug}-${name}`}
              style={{ zIndex: creators.length - idx }}
            >
              <Link
                href={`#${slug}`}
                title={name}
                custom
                className="group/creator -ml-6 block cursor-pointer rounded-full transition-all duration-75 select-none hover:-mt-4 hover:scale-105 hover:px-4 hover:pb-4"
                onClick={(e) => {
                  e.preventDefault();
                  history.pushState(null, "", `#${slug}`);
                  document.getElementById(slug)?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                draggable={false}
              >
                <div className="size-20 rounded-full border-4 border-alveus-green bg-alveus-green-800">
                  <Image
                    src={image}
                    alt=""
                    className="size-full rounded-full object-cover shadow-md transition-all duration-75 group-hover/creator:shadow-lg group-hover/creator:!brightness-105 group-hover/creator:contrast-115 group-hover/creator:!saturate-110 group-has-[:hover]/creators:brightness-75 group-has-[:hover]/creators:saturate-50"
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
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-alveus-green"
          style={{ zIndex: creators.length + 1 }}
        />

        <div className="flex" style={{ zIndex: creators.length + 2 }}>
          <div
            className={classes(
              "relative mx-auto flex transition-opacity",
              bar.width === dots && "pointer-events-none opacity-0",
            )}
          >
            {Array.from({ length: dots }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                className="z-0 p-1"
                onClick={() => {
                  const elm = ref.current;
                  if (!elm) return;

                  const scroll = idx / (dots - 1);
                  elm.scrollTo({
                    left: scroll * (elm.scrollWidth - elm.clientWidth),
                    behavior: "smooth",
                  });
                }}
              >
                <div className="size-3 rounded-full bg-alveus-green-300 shadow-xs" />
              </button>
            ))}

            <div
              className={classes(
                "absolute inset-y-0 z-10 m-1 h-3 rounded-full shadow-xs",
                bar.width === dots
                  ? "pointer-events-none"
                  : "cursor-grab select-none hover:bg-alveus-green-800",
                barDragging
                  ? "bg-alveus-green-800 transition-[background]"
                  : "bg-alveus-green-900 transition-[background,left]",
              )}
              style={{
                left: `calc((0.75rem * ${bar.start}) + (0.5rem * ${bar.start}))`,
                width: `calc((0.75rem * ${bar.width}) + (0.5rem * (${bar.width} - 1)))`,
              }}
              ref={barRef}
              onMouseDown={onBarMouseDown}
            />
          </div>
        </div>
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

const CollaborationItems = ({
  items,
  option,
  group,
  name,
  index,
  ref,
}: GroupedProps<Collaboration, HTMLDivElement>) => {
  const [lightboxOpen, setLightboxOpen] = useState<string>();

  const lightboxItems = useMemo(
    () =>
      items.reduce<Record<string, ReactNode>>(
        (acc, collaboration) => ({
          ...acc,
          [collaboration.slug]: (
            <YouTubeEmbed
              videoId={collaboration.videoId}
              caption={`${collaboration.name}: ${formatDateTime(collaboration.date, { style: "long" })}`}
            />
          ),
        }),
        {},
      ),
    [items],
  );

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash in lightboxItems) setLightboxOpen(hash);
  }, [lightboxItems]);

  return (
    <>
      {name && (
        <Heading
          level={-1}
          className={classes(
            "mb-6 border-b-2 border-alveus-green-300/25 pb-2 text-4xl text-alveus-green-800 [&>a]:flex [&>a]:items-end [&>a]:justify-between",
            index === 0 ? "mt-0" : "mt-8",
          )}
          id={`${option}:${group}`}
          link
        >
          {name}
          <small className="text-lg font-medium">{` (${items.length.toLocaleString()})`}</small>
        </Heading>
      )}

      <div className="flex flex-wrap" ref={ref}>
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

            <Link
              href={`https://www.youtube.com/watch?v=${collaboration.videoId}`}
              external
              onClick={(e) => {
                e.preventDefault();
                setLightboxOpen(collaboration.slug);
              }}
              custom
              className="group/trigger w-full max-w-2xl"
            >
              <YouTubePreview
                videoId={collaboration.videoId}
                className="aspect-video h-auto w-full"
              />
            </Link>

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
      </div>

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(undefined)}
        items={lightboxItems}
      />
    </>
  );
};

const CollaborationsPage: NextPage = () => {
  const { option, group, result } = useGrouped({
    items: collaborations,
    options: sortByOptions,
    initial: "all",
  });

  const sectionLinks = useMemo(
    () =>
      [...result.entries()].map(([key, value]) => ({
        name: value.name,
        href: `#${option}:${key}`,
      })),
    [result, option],
  );

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
          className="pointer-events-none absolute right-0 -bottom-16 z-30 hidden h-auto w-1/2 max-w-48 -scale-x-100 select-none lg:block"
        />

        <Section dark className="pt-24 pb-12">
          <div className="flex flex-wrap items-end">
            <div className="w-full lg:w-2/3">
              <Heading>Our Collaborations</Heading>

              <p className="text-lg text-balance">
                We work with other content creators to educate our combined
                audiences, introducing them to the educational ambassadors at
                Alveus and their conservation missions.
              </p>

              <p className="mt-2 text-lg text-balance">
                We&apos;ve hosted{" "}
                <abbr
                  title={`Across ${collaborations.length.toLocaleString()} collaboration streams`}
                >
                  {creators.length.toLocaleString()} creators
                </abbr>{" "}
                at the sanctuary since{" "}
                {collaborations.at(-1)!.date.getFullYear()}, bringing audiences
                from Twitch, YouTube, and other platforms, together to learn
                about the importance of conservation.
              </p>
            </div>

            <div className="w-full lg:w-1/3 lg:pl-2">
              <p className="text-lg text-balance">
                We also collaborate with various organizations to amplify their
                efforts and share their important work with our audience,
                furthering our mission of conservation and education.
              </p>

              <p className="mt-2 text-lg">
                <Link href="/about/orgs" dark>
                  Explore some of our NGO collaborations
                  <IconArrowRight size={16} className="ml-1 inline-block" />
                </Link>
              </p>
            </div>
          </div>

          <Creators className="mt-6" />
        </Section>
      </div>

      <SubNav links={sectionLinks} className="z-20" />

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-40 select-none lg:block 2xl:-bottom-48 2xl:max-w-48"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-60 z-10 hidden h-auto w-1/2 max-w-40 select-none lg:block 2xl:-bottom-64 2xl:max-w-48"
        />

        <Section className="grow">
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
