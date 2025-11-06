import type { InferGetStaticPropsType, NextPage } from "next";
import Image from "next/image";
import NextLink from "next/link";
import {
  type KeyboardEventHandler,
  type WheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import scrollIntoView from "smooth-scroll-into-view-if-needed";

import {
  getMapFeatures,
  getPostsCount,
  getPostsToShow,
  getPublicPosts,
  getUsersCount,
} from "@/server/db/show-and-tell";

import { classes } from "@/utils/classes";
import { delay } from "@/utils/delay";
import { extractInfoFromMapFeatures } from "@/utils/locations";
import { trpc } from "@/utils/trpc";

import useOnToggleNativeFullscreen from "@/hooks/fullscreen";
import useIntersectionObserver from "@/hooks/intersection";
import useLocaleString from "@/hooks/locale";

import Box from "@/components/content/Box";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { Button, LinkButton } from "@/components/shared/form/Button";
import { GiveAnHourProgress } from "@/components/show-and-tell/GiveAnHourProgress";
import { QrCode } from "@/components/show-and-tell/QrCode";
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";

import IconArrowDown from "@/icons/IconArrowDown";
import IconArrowRight from "@/icons/IconArrowRight";
import IconArrowUp from "@/icons/IconArrowUp";
import IconArrowsIn from "@/icons/IconArrowsIn";
import IconArrowsOut from "@/icons/IconArrowsOut";
import IconGlobe from "@/icons/IconGlobe";
import IconLoading from "@/icons/IconLoading";
import IconMapPin from "@/icons/IconMapPin";
import IconPencil from "@/icons/IconPencil";
import IconUserGroup from "@/icons/IconUserGroup";

import alveusLogo from "@/assets/logo.png";
import showAndTellHeader from "@/assets/show-and-tell/header.png";
import mapImage from "@/assets/show-and-tell/map.jpg";
import showAndTellPeepo from "@/assets/show-and-tell/peepo.png";

export type ShowAndTellPageProps = InferGetStaticPropsType<
  typeof getStaticProps
>;

const entriesPerPage = 10;

export const bentoBoxClasses =
  "bg-alveus-green-600 text-center text-white flex flex-col justify-center gap-2";

// We pre-render the first page of entries using SSR and then use client-side rendering to
// update the data and fetch more entries on demand
export const getStaticProps = async () => {
  const entries = await getPublicPosts({ take: entriesPerPage + 1 });

  let nextCursor: string | undefined = undefined;
  if (entries.length > entriesPerPage) {
    const nextItem = entries.pop();
    nextCursor = nextItem?.id || undefined;
  }
  const totalPostsCount = await getPostsCount();
  const usersCount = await getUsersCount();
  const postsToShowCount = await getPostsToShow();

  const { locations, countries, postsFromANewLocation } =
    extractInfoFromMapFeatures(await getMapFeatures());

  return {
    props: {
      entries,
      nextCursor,
      totalPostsCount,
      postsToShowCount,
      usersCount,
      uniqueLocationsCount: locations.size,
      uniqueCountriesCount: countries.size,
      postsFromANewLocation,
    },
  };
};

const isShowAndTellEntry = (
  element: Element | null | undefined,
): element is HTMLElement =>
  element instanceof HTMLElement &&
  element.hasAttribute("data-show-and-tell-entry");

const ShowAndTellIndexPage: NextPage<ShowAndTellPageProps> = ({
  entries: initialEntries,
  nextCursor,
  totalPostsCount,
  postsToShowCount,
  usersCount,
  uniqueLocationsCount,
  uniqueCountriesCount,
  postsFromANewLocation,
}) => {
  const entries = trpc.showAndTell.getEntries.useInfiniteQuery(
    {},
    {
      initialData: {
        pageParams: [],
        pages: [{ items: initialEntries, nextCursor: nextCursor }],
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    },
  );

  // Format the stats
  const totalPostsCountFmt = useLocaleString(totalPostsCount);
  const usersCountFmt = useLocaleString(usersCount);
  const uniqueLocationsCountFmt = useLocaleString(uniqueLocationsCount);
  const uniqueCountriesCountFmt = useLocaleString(uniqueCountriesCount);

  const [isPresentationView, setIsPresentationView] = useState(false);
  const presentationViewRootElementRef = useRef<HTMLDivElement>(null);

  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [currentPostAuthor, setCurrentPostAuthor] = useState("");

  // We use this ref to scroll to the entry when transitioning between presentation view and normal view
  // and when the next/prev buttons are clicked
  const currentEntryElementRef = useRef<HTMLElement>(null);

  // We use these states to control whether the next/prev buttons are enabled
  // and whether the click regions are visible in presentation view
  const [hasPrevEntry, setHasPrevEntry] = useState(false);
  const [hasNextEntry, setHasNextEntry] = useState(false);

  // Use the DOM to determine if we have entries around the current one,
  // and check if we should fetch the next page based on remaining entries
  const checkPosition = useCallback(() => {
    const currentEntryElement = currentEntryElementRef.current;
    if (!currentEntryElement) return;

    // Get author from the current entry (using a data attribute)
    setCurrentPostAuthor(
      currentEntryElement.getAttribute("data-show-and-tell-author") || "",
    );

    // Get the current position of the current entry
    const allEntries =
      currentEntryElement.parentElement?.getElementsByTagName("article");
    if (!allEntries) return;
    const entryElements = Array.from(allEntries);
    const currentPos = entryElements.indexOf(currentEntryElement);

    // Update the next/prev buttons
    setHasPrevEntry(currentPos > 0);
    setHasNextEntry(currentPos < entryElements.length - 1);

    // Set the current post index
    setCurrentPostIndex(currentPos + 1); // Add 1 to make it 1-based index

    // Only autoload if we're in presentation view, and if there's a next page
    if (!isPresentationView || !entries.hasNextPage) return;

    // Check if we need to load more entries
    const itemsLeft = entryElements.length - currentPos;
    if (itemsLeft <= 2) entries.fetchNextPage().then(() => undefined);
  }, [entries, isPresentationView]);

  // Keep reference which element is currently visible and autoload more entries if necessary
  const onEntryIntersection = useCallback(
    async (intersectionElements: IntersectionObserverEntry[]) => {
      for (const entry of intersectionElements) {
        if (entry?.target instanceof HTMLElement && entry.isIntersecting) {
          if (currentEntryElementRef.current !== entry.target) {
            currentEntryElementRef.current = entry.target;
            await checkPosition();
          }
          break;
        }
      }
    },
    [checkPosition],
  );
  const intersectionObserverOpts = useMemo(() => ({ threshold: 0.55 }), []);
  const registerObserveElement = useIntersectionObserver(
    onEntryIntersection,
    intersectionObserverOpts,
  );

  // Scroll an element into the center of the viewport
  const scrollTo = useCallback((element: HTMLElement) => {
    // We use a library to do this, because not every browser supports it
    // And even in Chrome, smooth breaks for the first/last element of things
    scrollIntoView(element, {
      behavior: "smooth",
      block: "center",
    });
    element.focus({ preventScroll: true });
  }, []);
  const scrollToPrev = useCallback(() => {
    const prev = currentEntryElementRef.current?.previousElementSibling;
    if (isShowAndTellEntry(prev)) {
      scrollTo(prev);
    }
  }, [scrollTo]);
  const scrollToNext = useCallback(() => {
    const next = currentEntryElementRef.current?.nextElementSibling;
    if (isShowAndTellEntry(next)) {
      scrollTo(next);
    }
  }, [scrollTo]);

  // Track when the user is manually scrolling
  const userScrolling = useRef(false);
  const userScrollingTimeout = useRef<NodeJS.Timeout>(null);
  const userScrollingTimeoutMs = 100;
  const onUserScroll = useCallback(() => {
    userScrolling.current = true;
    if (userScrollingTimeout.current)
      clearTimeout(userScrollingTimeout.current);
    userScrollingTimeout.current = setTimeout(() => {
      userScrolling.current = false;
    }, userScrollingTimeoutMs);
  }, []);

  // When the user scrolls in presentation view, we want to debounce snapping
  const scrollTrack = useRef<{
    element: HTMLElement;
    scroll: number;
    timer: NodeJS.Timeout;
  }>(null);
  const scrollDebounce = 250; // Milliseconds to wait before snapping
  const scrollThreshold = 0.1; // multiplier of the viewport height
  const onScroll = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      // Ignore the event if we're not in presentation view,
      // or if we're not currently on an entry,
      // or if the user isn't scrolling
      if (
        !isPresentationView ||
        !currentEntryElementRef.current ||
        !userScrolling.current
      )
        return;

      // If we are currently debouncing, cancel the existing debounce
      if (scrollTrack.current) clearTimeout(scrollTrack.current.timer);

      // Create/update the scroll debounce
      const target = e.currentTarget;
      scrollTrack.current = {
        element: scrollTrack.current?.element || currentEntryElementRef.current,
        scroll: scrollTrack.current?.scroll || target.scrollTop,
        timer: setTimeout(() => {
          if (!scrollTrack.current || !currentEntryElementRef.current) return;

          // Get the distance we've scrolled since the start of the debounce
          const distance = target.scrollTop - scrollTrack.current.scroll;

          // If we're on the same element we started on,
          // move up/down based on scroll distance
          let scroll = currentEntryElementRef.current;
          if (
            scroll === scrollTrack.current.element &&
            Math.abs(distance) > target.offsetHeight * scrollThreshold
          ) {
            scroll =
              distance > 0
                ? (scroll.nextElementSibling as HTMLElement)
                : (scroll.previousElementSibling as HTMLElement);
          }

          if (isShowAndTellEntry(scroll)) {
            // Scroll the element to the center of the viewport
            scrollTo(scroll);
          }

          // Reset the debounce
          scrollTrack.current = null;
        }, scrollDebounce),
      };
    },
    [isPresentationView, scrollTo],
  );

  const togglePresentationView = useCallback(
    (scrollTargetElement: HTMLElement | null, value: boolean) => {
      if (value === isPresentationView) {
        return;
      }

      setIsPresentationView(value);
      transitionBetweenViews(
        value,
        presentationViewRootElementRef.current,
        scrollTargetElement,
      ).then(() => {
        if (value && currentEntryElementRef.current) {
          // If we're entering presentation view, ensure the entry is aligned
          scrollTo(currentEntryElementRef.current);
        }
      });
    },
    [isPresentationView, scrollTo],
  );

  // Enable presentation view if native fullscreen gets activated, but not if it's deactivated
  useOnToggleNativeFullscreen(
    useCallback(
      (isFullscreen) => {
        if (isFullscreen) {
          togglePresentationView(currentEntryElementRef.current, true);
        }
      },
      [togglePresentationView],
    ),
  );

  const handleTogglePresentationView = useCallback(() => {
    togglePresentationView(currentEntryElementRef.current, !isPresentationView);
  }, [isPresentationView, togglePresentationView]);
  const entryIdToFocusRef = useRef<string>(null);

  const handleLoadNext = useCallback(async () => {
    // Keeping track of the number of pages before starting to load more
    const pageBefore = entries.data?.pages.length;

    const res = await entries.fetchNextPage();

    const pages = res.data?.pages;
    if (!pages) return;

    // When loading more, set the focus to the first entry of the newly loaded page
    // or if no new page was loaded, set the focus to the last entry of the last page,
    // but we can't focus it directly, because it did not render yet, so we store
    // the id in a ref.
    const hasLoadedNewPage = !pageBefore || pages.length > pageBefore;
    const lastPageItems = pages[pages.length - 1]?.items;

    entryIdToFocusRef.current =
      (hasLoadedNewPage
        ? lastPageItems?.[0]?.id
        : lastPageItems?.[lastPageItems.length - 1]?.id) ?? null;
  }, [entries]);

  useEffect(() => {
    // Check if we need to focus an entry after loading more
    if (entryIdToFocusRef.current) {
      const element = presentationViewRootElementRef.current?.querySelector(
        `[data-show-and-tell-entry="${entryIdToFocusRef.current}"]`,
      );
      if (isShowAndTellEntry(element)) {
        scrollTo(element);
        entryIdToFocusRef.current = null;
      }
    }
  }, [entries.data, scrollTo]);

  const handleArrowKeys: KeyboardEventHandler = useCallback(
    (event) => {
      if (event.key === "ArrowUp") {
        scrollToPrev();
      } else if (event.key === "ArrowDown") {
        scrollToNext();
      }
    },
    [scrollToPrev, scrollToNext],
  );

  return (
    <>
      <Meta
        title="Show and Tell"
        description="See what the Alveus community has been up to as they share their conservation and wildlife-related activities, or share your own activities."
        image={showAndTellHeader.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-0"
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="w-full pt-8 pb-4 md:w-3/5 md:py-20">
          <Heading>Show and Tell</Heading>
          <p className="text-lg">
            See what the Alveus community has been up to as they share their
            conservation and wildlife-related activities, <br />
            or share your own via the{" "}
            <Link href="/show-and-tell/submit-post" dark>
              submission page
            </Link>
            .
          </p>
        </div>

        <Image
          src={showAndTellPeepo}
          width={448}
          alt=""
          className="mx-auto w-1/2 max-w-md p-4 pb-16 md:mx-0 md:w-1/4 md:pb-4"
        />
      </Section>

      <Section className="py-6 md:py-12">
        <div className="grid w-full grid-cols-4 grid-rows-auto-3 gap-4 md:grid-cols-6 md:grid-rows-auto-2">
          <Box
            className={classes(
              bentoBoxClasses,
              "col-span-4 col-start-1 row-start-3 p-0 text-lg transition-transform duration-200 hover:scale-102 md:col-span-2 md:row-span-2",
            )}
          >
            <NextLink
              href="/show-and-tell/map"
              className="group grid h-full grid-cols-1"
            >
              <Image
                src={mapImage}
                className="col-start-1 row-start-1 h-full max-h-24 rounded-xl object-cover transition-opacity duration-200 group-hover:opacity-90 md:max-h-full"
                alt=""
              />
              <div className="relative col-start-1 row-start-1 flex flex-col items-end justify-end">
                <div className="z-10 flex items-center justify-end gap-2 rounded-tl-xl bg-alveus-green-600 p-2 px-4 text-right text-white transition-colors group-hover:bg-alveus-green-700">
                  Community map
                  <IconArrowRight className="size-8" />
                </div>
              </div>
            </NextLink>
          </Box>

          <Box
            dark
            className={classes(bentoBoxClasses, "items-center p-2 md:text-lg")}
          >
            <IconUserGroup className="size-10" />
            {usersCountFmt} members
          </Box>
          <Box
            dark
            className={classes(bentoBoxClasses, "items-center p-2 md:text-lg")}
          >
            <IconPencil className="size-10" />
            {totalPostsCountFmt} posts
          </Box>
          <Box
            dark
            className={classes(bentoBoxClasses, "items-center p-2 md:text-lg")}
          >
            <IconMapPin className="size-10" />
            {uniqueLocationsCountFmt} locations
          </Box>
          <Box
            dark
            className={classes(bentoBoxClasses, "items-center p-2 md:text-lg")}
          >
            <IconGlobe className="size-10" />
            {uniqueCountriesCountFmt} countries
          </Box>

          <Box
            dark
            className={classes(
              bentoBoxClasses,
              "col-start-1 col-end-5 row-start-2 p-4 md:col-start-3 md:col-end-7",
            )}
          >
            <p className="text-left md:text-center">
              We&apos;re tracking hours spent as part of the Alveus
              community&apos;s effort to{" "}
              <Link
                href="/show-and-tell/give-an-hour"
                className="text-nowrap"
                dark
              >
                Give an Hour
              </Link>{" "}
              for Earth.
            </p>
            <div className="mt-2">
              <GiveAnHourProgress />
            </div>
          </Box>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow" offsetParent={!isPresentationView}>
        <div
          ref={presentationViewRootElementRef}
          onWheel={onUserScroll}
          onScroll={onScroll}
          className={
            "scrollbar-none flex flex-col transition-colors duration-200 " +
            (isPresentationView
              ? "fixed inset-0 z-100 gap-5 overflow-x-hidden overflow-y-auto bg-black p-5"
              : "gap-20 bg-white/0")
          }
          onKeyDown={handleArrowKeys}
          tabIndex={-1}
        >
          {entries.data?.pages.flatMap((page) =>
            page.items.map((entry) => (
              <ShowAndTellEntry
                entry={entry}
                isPresentationView={isPresentationView}
                key={entry.id}
                ref={registerObserveElement}
                newLocation={postsFromANewLocation.has(entry.id)}
              />
            )),
          )}

          {!isPresentationView && entries.isSuccess && !entries.hasNextPage && (
            <p className="border-t border-gray-700 p-4 text-center text-lg">
              - End -
            </p>
          )}

          {entries.hasNextPage && (
            <Button onClick={handleLoadNext}>
              {entries.isFetchingNextPage ? (
                <>
                  <IconLoading size={20} /> Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          )}

          {isPresentationView && (
            <>
              {/* 6em come from 100vh-6em on each article, 1.25rem from the gap-5 on the container */}
              {hasPrevEntry && (
                <button
                  className="group fixed top-0 left-5 z-20 h-[calc(6em/2)] w-[calc(80%-2em)]"
                  type="button"
                  onClick={scrollToPrev}
                >
                  <span className="sr-only">Previous Post</span>
                </button>
              )}
              {hasNextEntry && (
                <button
                  className={
                    "fixed bottom-0 left-5 z-20 w-[calc(80%-2em)] " +
                    (hasPrevEntry ? "h-[calc(6em/2)]" : "h-[calc(6em-1.25rem)]")
                  }
                  type="button"
                  onClick={scrollToNext}
                >
                  <span className="sr-only">Next Post</span>
                </button>
              )}

              <div className="fixed top-[20px] right-[20px] z-20 ml-auto flex w-[calc(20%-2em)] flex-col items-center gap-4 text-alveus-green">
                <div className="flex flex-row items-center gap-1">
                  <Heading level={1} className="pt-3">
                    Show and Tell
                  </Heading>
                  <Image
                    src={alveusLogo}
                    alt=""
                    height={120}
                    className="-mt-1 h-10 w-auto lg:mt-6 lg:h-28"
                  />
                </div>
                <p className="text-sm lg:text-base xl:text-lg">
                  Has stream helped you become more environmentally conscious?
                  Please share with the community any of your conservation or
                  wildlife-related activities.
                </p>
                <QrCode className="h-auto max-h-[20vh] w-full max-w-[12vw]" />
              </div>
            </>
          )}

          <div className="sticky right-[20px] bottom-[20px] z-20 ml-auto flex w-fit flex-col gap-2 select-none">
            {isPresentationView && currentPostAuthor && (
              <p className="max-w-40 text-lg text-alveus-green-300">
                by {currentPostAuthor}
              </p>
            )}
            {isPresentationView && (
              <p className="text-xl text-alveus-green">
                {postsToShowCount - currentPostIndex <= 0
                  ? "Caught up!"
                  : `${postsToShowCount - currentPostIndex} / ${postsToShowCount} remaining`}
              </p>
            )}
            <div className="flex flex-row gap-2">
              <Button
                className="bg-white shadow-lg dark:bg-alveus-green-900"
                disabled={!hasPrevEntry}
                onClick={scrollToPrev}
              >
                <IconArrowUp className="size-5" />
                <span className="sr-only">Previous Post</span>
              </Button>
              <Button
                className="bg-white shadow-lg dark:bg-alveus-green-900"
                disabled={!hasNextEntry}
                onClick={scrollToNext}
              >
                <IconArrowDown className="size-5" />
                <span className="sr-only">Next Post</span>
              </Button>
            </div>

            <Button
              className="hidden bg-white shadow-lg lg:flex dark:bg-alveus-green-900"
              onClick={handleTogglePresentationView}
            >
              {isPresentationView ? (
                <>
                  <IconArrowsIn className="size-5" />
                  <span>Close Fullscreen</span>
                </>
              ) : (
                <>
                  <IconArrowsOut className="size-5" />
                  <span>Open Fullscreen</span>
                </>
              )}
            </Button>

            <LinkButton
              href="/show-and-tell/submit-post"
              className="bg-white shadow-lg dark:bg-alveus-green-900"
            >
              <IconPencil className="size-5" />
              <span>
                Submit
                <span className="hidden lg:inline"> Post</span>
              </span>
            </LinkButton>
          </div>
        </div>
      </Section>
    </>
  );
};

export default ShowAndTellIndexPage;

// This function is used to transition between the normal and presentation view
async function transitionBetweenViews(
  value: boolean,
  presentationViewRootElement: HTMLElement | null = null,
  scrollTargetElement: HTMLElement | null = null,
) {
  if (value) {
    // Case 1: Normal view -> Presentation view

    // Hide entries while transitioning
    if (presentationViewRootElement) {
      [].forEach.call(
        presentationViewRootElement.children,
        (child: HTMLElement) => {
          child.style.opacity = "0";
        },
      );
    }

    // If possible, open native fullscreen
    if ("requestFullscreen" in document.documentElement) {
      try {
        await document.documentElement.requestFullscreen();
        await delay(300);
      } catch (_) {}
    }
  } else {
    // Case 2: Presentation view -> Normal view

    // Close native fullscreen, if active
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (_) {}
    }
  }

  // Disable scrolling in presentation view
  document.body.style.overflow = value ? "hidden" : "";

  // Always scroll to the target element
  await delay(10);
  scrollTargetElement?.scrollIntoView({ behavior: "auto" });

  // Show entries again if we transitioned to fullscreen
  if (value && presentationViewRootElement) {
    await delay(100);
    [].forEach.call(
      presentationViewRootElement.children,
      (child: HTMLElement) => {
        child.style.opacity = "1";
      },
    );
  }
}
