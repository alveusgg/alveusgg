import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type WheelEvent,
  type KeyboardEventHandler,
} from "react";
import type { InferGetStaticPropsType, NextPage } from "next";
import Image from "next/image";
import scrollIntoView from "smooth-scroll-into-view-if-needed";

import { delay } from "@/utils/delay";
import { trpc } from "@/utils/trpc";
import {
  getPosts,
  getPostsCount,
  getUsersCount,
} from "@/server/db/show-and-tell";

import useOnToggleNativeFullscreen from "@/hooks/fullscreen";
import useIntersectionObserver from "@/hooks/intersection";
import useLocaleString from "@/hooks/locale";

import IconLoading from "@/icons/IconLoading";
import IconArrowUp from "@/icons/IconArrowUp";
import IconArrowDown from "@/icons/IconArrowDown";
import IconArrowsIn from "@/icons/IconArrowsIn";
import IconArrowsOut from "@/icons/IconArrowsOut";
import IconPencil from "@/icons/IconPencil";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";

import { Button, LinkButton } from "@/components/shared/form/Button";

import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";
import { QrCode } from "@/components/show-and-tell/QrCode";
import { GiveAnHourProgress } from "@/components/show-and-tell/GiveAnHourProgress";

import alveusLogo from "@/assets/logo.png";
import showAndTellPeepo from "@/assets/show-and-tell/peepo.png";
import showAndTellHeader from "@/assets/show-and-tell/header.png";

export type ShowAndTellPageProps = InferGetStaticPropsType<
  typeof getStaticProps
>;

const entriesPerPage = 10;

// We pre-render the first page of entries using SSR and then use client-side rendering to
// update the data and fetch more entries on demand
export const getStaticProps = async () => {
  const entries = await getPosts({ take: entriesPerPage + 1 });

  let nextCursor: string | undefined = undefined;
  if (entries.length > entriesPerPage) {
    const nextItem = entries.pop();
    nextCursor = nextItem?.id || undefined;
  }
  const totalPostsCount = await getPostsCount();
  const usersCount = await getUsersCount();

  return {
    props: {
      entries,
      nextCursor,
      totalPostsCount,
      usersCount,
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
  usersCount,
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

  const [isPresentationView, setIsPresentationView] = useState(false);
  const presentationViewRootElementRef = useRef<HTMLDivElement | null>(null);

  // We use this ref to scroll to the entry when transitioning between presentation view and normal view
  // and when the next/prev buttons are clicked
  const currentEntryElementRef = useRef<HTMLElement | null>(null);

  // We use these states to control whether the next/prev buttons are enabled
  // and whether the click regions are visible in presentation view
  const [hasPrevEntry, setHasPrevEntry] = useState(false);
  const [hasNextEntry, setHasNextEntry] = useState(false);

  // Use the DOM to determine if we have entries around the current one,
  // and check if we should fetch the next page based on remaining entries
  const checkPosition = useCallback(() => {
    const currentEntryElement = currentEntryElementRef.current;
    if (!currentEntryElement) return;

    // Get the current position of the current entry
    const allEntries =
      currentEntryElement.parentElement?.getElementsByTagName("article");
    if (!allEntries) return;
    const entryElements = Array.from(allEntries);
    const currentPos = entryElements.indexOf(currentEntryElement);

    // Update the next/prev buttons
    setHasPrevEntry(currentPos > 0);
    setHasNextEntry(currentPos < entryElements.length - 1);

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
  const userScrollingTimeout = useRef<NodeJS.Timeout>();
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
  }>();
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
          scrollTrack.current = undefined;
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
  const entryIdToFocusRef = useRef<string>();

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

    entryIdToFocusRef.current = hasLoadedNewPage
      ? lastPageItems?.[0]?.id
      : lastPageItems?.[lastPageItems.length - 1]?.id;
  }, [entries]);

  useEffect(() => {
    // Check if we need to focus an entry after loading more
    if (entryIdToFocusRef.current) {
      const element = presentationViewRootElementRef.current?.querySelector(
        `[data-show-and-tell-entry="${entryIdToFocusRef.current}"]`,
      );
      if (isShowAndTellEntry(element)) {
        scrollTo(element);
        entryIdToFocusRef.current = undefined;
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
        <div className="w-full pb-4 pt-8 md:w-3/5 md:py-24">
          <Heading>Show and Tell</Heading>
          <p className="text-lg">
            See what the Alveus community has been up to as they share their
            conservation and wildlife-related activities.
          </p>

          <p className="text-lg">
            Been up to something yourself? Share your own activities via the{" "}
            <Link href="/show-and-tell/submit-post" dark>
              submission page
            </Link>
            .
          </p>

          <p className="mt-8">
            {usersCountFmt} members of the Alveus community have shared their
            activities with {totalPostsCountFmt} posts.
          </p>

          <p className="mt-8">
            As a community, we&apos;re tracking the hours we spend giving back
            to the planet, originally as part of WWF&apos;s{" "}
            <Link
              href="/show-and-tell/give-an-hour"
              dark
              className="whitespace-nowrap"
            >
              Give an Hour
            </Link>{" "}
            initiative.
          </p>
          <div className="mt-2">
            <GiveAnHourProgress />
          </div>
        </div>

        <Image
          src={showAndTellPeepo}
          width={448}
          alt=""
          className="mx-auto w-full max-w-md p-4 pb-16 md:mx-0 md:w-2/5 md:pb-4"
        />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow" offsetParent={!isPresentationView}>
        <div
          ref={presentationViewRootElementRef}
          onWheel={onUserScroll}
          onScroll={onScroll}
          className={
            "scrollbar-none flex flex-col transition-colors duration-200 " +
            (isPresentationView
              ? "fixed inset-0 z-[100] gap-5 overflow-y-auto overflow-x-hidden bg-black p-5"
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
                showPermalink={true}
                key={entry.id}
                ref={registerObserveElement}
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
                  className="group fixed left-5 top-0 z-20 h-[calc(6em/2)] w-[calc(80%-2em)]"
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

              <div className="fixed right-[20px] top-[20px] z-20 ml-auto flex w-[calc(20%-2em)] flex-col items-center gap-4 text-alveus-green">
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
                  Has stream helped you become more environmental conscious?
                  Please share with the community any of your conservation or
                  wildlife related activities.
                </p>
                <QrCode className="h-auto max-h-[20vh] w-full max-w-[12vw]" />
              </div>
            </>
          )}

          <div className="sticky bottom-[20px] right-[20px] z-20 ml-auto flex w-fit flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Button
                className="bg-white shadow-lg"
                disabled={!hasPrevEntry}
                onClick={scrollToPrev}
              >
                <IconArrowUp className="h-5 w-5" />
                <span className="sr-only">Previous Post</span>
              </Button>
              <Button
                className="bg-white shadow-lg"
                disabled={!hasNextEntry}
                onClick={scrollToNext}
              >
                <IconArrowDown className="h-5 w-5" />
                <span className="sr-only">Next Post</span>
              </Button>
            </div>

            <Button
              className="hidden bg-white shadow-lg lg:flex"
              onClick={handleTogglePresentationView}
            >
              {isPresentationView ? (
                <>
                  <IconArrowsIn className="h-5 w-5" />
                  <span>Close Fullscreen</span>
                </>
              ) : (
                <>
                  <IconArrowsOut className="h-5 w-5" />
                  <span>Open Fullscreen</span>
                </>
              )}
            </Button>

            <LinkButton
              href="/show-and-tell/submit-post"
              className="bg-white shadow-lg"
            >
              <IconPencil className="h-5 w-5" />
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
    if (
      presentationViewRootElement &&
      presentationViewRootElement !== document.fullscreenElement &&
      "requestFullscreen" in presentationViewRootElement
    ) {
      try {
        await presentationViewRootElement.requestFullscreen();
        await delay(300);
      } catch (e) {}
    }
  } else {
    // Case 2: Presentation view -> Normal view

    // Close native fullscreen, if active
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (e) {}
    }
  }

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
