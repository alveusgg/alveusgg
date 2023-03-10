import React, { useCallback, useRef, useState } from "react";
import type { InferGetStaticPropsType, NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowUpIcon,
} from "@heroicons/react/20/solid";
import { prisma } from "@/server/db/client";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import { ShowAndTellNavigation } from "@/components/show-and-tell/ShowAndTellNavigation";
import { Button } from "@/components/shared/Button";
import { delay } from "@/utils/delay";
import logoImage from "@/assets/logo.png";
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";
import { QrCode } from "@/components/show-and-tell/QrCode";
import { withAttachments } from "@/server/db/show-and-tell";
import { trpc } from "@/utils/trpc";
import IconLoading from "@/icons/IconLoading";
import { useOnToggleNativeFullscreen } from "@/components/shared/hooks/useOnToggleNativeFullscreen";
import { useIntersectionObserver } from "@/components/shared/hooks/useIntersectionObserver";

export type ShowAndTellPageProps = InferGetStaticPropsType<
  typeof getStaticProps
>;

const entriesPerPage = 10;

// We pre-render the first page of entries using SSR and then use client-side rendering to
// update the data and fetch more entries on demand
export const getStaticProps = async () => {
  const entries = await prisma.showAndTellEntry.findMany({
    where: {
      approvedAt: { gte: prisma.showAndTellEntry.fields.updatedAt },
    },
    orderBy: { approvedAt: "desc" },
    include: {
      ...withAttachments.include,
      user: true,
    },
    take: entriesPerPage + 1,
  });

  let nextCursor: string | undefined = undefined;
  if (entries.length > entriesPerPage) {
    const nextItem = entries.pop();
    nextCursor = nextItem?.id || undefined;
  }

  return {
    props: {
      entries,
      nextCursor,
    },
  };
};

const ShowAndTellIndexPage: NextPage<ShowAndTellPageProps> = ({
  entries: initialEntries,
  nextCursor,
}) => {
  const entries = trpc.showAndTell.getEntries.useInfiniteQuery(
    {},
    {
      initialData: {
        pageParams: [],
        pages: [{ items: initialEntries, nextCursor: nextCursor }],
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const [isPresentationView, setIsPresentationView] = useState(false);
  const presentationViewRootElementRef = useRef<HTMLDivElement | null>(null);

  // We use this ref to scroll to the entry when transitioning between presentation view and normal view
  // and when the next/prev buttons are clicked
  const currentEntryElementRef = useRef<HTMLElement | null>(null);

  const autoLoadMore = useCallback(async () => {
    const currentEntryElement = currentEntryElementRef.current;
    if (!currentEntryElement || !isPresentationView || !entries.hasNextPage) {
      return;
    }

    // Use the DOM to determine if we should fetch the next page
    // by counting the number of entries left after the current entry
    const allEntries =
      currentEntryElement.parentElement?.getElementsByTagName("article");
    if (!allEntries) {
      return;
    }

    const entryElements = Array.from(allEntries);
    const itemsLeft =
      entryElements.length - entryElements.indexOf(currentEntryElement);
    if (itemsLeft <= 2) {
      await entries.fetchNextPage();
    }
  }, [entries, isPresentationView]);

  // Keep reference which element is currently visible and autoload more entries if necessary
  const onEntryIntersection = useCallback(
    async (intersectionElements: IntersectionObserverEntry[]) => {
      for (const entry of intersectionElements) {
        if (entry?.target instanceof HTMLElement && entry.isIntersecting) {
          if (currentEntryElementRef.current !== entry.target) {
            currentEntryElementRef.current = entry.target;
            await autoLoadMore();
          }
          break;
        }
      }
    },
    [autoLoadMore]
  );
  const registerObserveElement = useIntersectionObserver(onEntryIntersection);

  const togglePresentationView = useCallback(
    (scrollTargetElement: HTMLElement | null, value: boolean) => {
      if (value === isPresentationView) {
        return;
      }

      setIsPresentationView(value);
      transitionBetweenViews(
        value,
        presentationViewRootElementRef.current,
        scrollTargetElement
      ).then(() => undefined);
    },
    [isPresentationView]
  );

  // Enable presentation view if native fullscreen gets activated, but not if it's deactivated
  useOnToggleNativeFullscreen(
    useCallback(
      (isFullscreen) => {
        if (isFullscreen) {
          togglePresentationView(currentEntryElementRef.current, true);
        }
      },
      [togglePresentationView]
    )
  );

  const handleTogglePresentationView = useCallback(() => {
    togglePresentationView(currentEntryElementRef.current, !isPresentationView);
  }, [isPresentationView, togglePresentationView]);

  return (
    <>
      <Head>
        <title>Show and Tell | Alveus.gg</title>
      </Head>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-12"
        containerClassName="flex flex-wrap gap-4 justify-between"
      >
        <div className="w-full lg:w-3/5">
          <Heading level={1}>Show and Tell</Heading>
          <p className="text-lg">
            Community submissions of their conservation and wildlife related
            activities. If you would like to submit your own story, please head
            to the{" "}
            <Link href="/show-and-tell/submit-post" className="underline">
              submission page
            </Link>
            .
          </p>
        </div>
        <ShowAndTellNavigation />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow" offsetParent={!isPresentationView}>
        <div
          ref={presentationViewRootElementRef}
          className={
            "scrollbar-none flex flex-col transition-colors duration-200 " +
            (isPresentationView
              ? "fixed inset-0 z-[100] snap-y snap-mandatory gap-5 overflow-y-auto overflow-x-hidden bg-black p-5"
              : "gap-20 bg-white/0")
          }
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
            ))
          )}

          {entries.isSuccess && !entries.hasNextPage && (
            <p className="border-t border-gray-700 p-4 text-center text-lg">
              - End -
            </p>
          )}

          {entries.hasNextPage && (
            <Button onClick={() => entries.fetchNextPage()}>
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
            <div className="fixed top-[20px] right-[20px] z-10 z-20 ml-auto flex w-[calc(20%-2em)] flex-col items-center gap-4 text-alveus-green">
              <div className="flex flex-row items-center gap-1">
                <Heading level={1} className="pt-3">
                  Show and Tell
                </Heading>
                <Image
                  src={logoImage}
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
              <QrCode className="h-auto max-h-[20vh] w-full w-auto max-w-[12vw]" />
            </div>
          )}

          <div className="sticky bottom-[20px] right-[20px] z-20 ml-auto flex w-fit flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Button
                className="bg-white shadow-lg"
                onClick={() =>
                  currentEntryElementRef.current?.previousElementSibling?.scrollIntoView(
                    { behavior: "smooth", block: "start" }
                  )
                }
              >
                <ArrowUpIcon className="h-5 w-5" />
                <span className="sr-only">Previous Post</span>
              </Button>
              <Button
                className="bg-white shadow-lg"
                onClick={() =>
                  currentEntryElementRef.current?.nextElementSibling?.scrollIntoView(
                    { behavior: "smooth", block: "start" }
                  )
                }
              >
                <ArrowDownIcon className="h-5 w-5" />
                <span className="sr-only">Next Post</span>
              </Button>
            </div>

            <Button
              className="bg-white shadow-lg"
              onClick={handleTogglePresentationView}
            >
              {isPresentationView ? (
                <>
                  <ArrowsPointingInIcon className="h-5 w-5" /> Close Fullscreen
                </>
              ) : (
                <>
                  <ArrowsPointingOutIcon className="h-5 w-5" /> Open Fullscreen
                </>
              )}
            </Button>
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
  scrollTargetElement: HTMLElement | null = null
) {
  if (value) {
    // Case 1: Normal view -> Presentation view

    // Hide entries while transitioning
    if (presentationViewRootElement) {
      [].forEach.call(
        presentationViewRootElement.children,
        (child: HTMLElement) => {
          child.style.opacity = "0";
        }
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
      }
    );
  }
}
