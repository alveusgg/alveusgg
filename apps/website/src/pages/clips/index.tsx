import type { NextPage } from "next";
import Image from "next/image";
import scrollIntoView from "smooth-scroll-into-view-if-needed";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog } from "@headlessui/react";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Select from "@/components/content/Select";

import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import { trpc } from "@/utils/trpc";
import type { SortType } from "@/server/db/clips";
import { Button } from "@/components/shared/form/Button";
import IconLoading from "@/icons/IconLoading";
import Consent from "@/components/Consent";
import IconThumbsUp from "@/icons/IconThumbsUp";
import { classes } from "@/utils/classes";
import DateTime from "@/components/content/DateTime";
import ClipsNavigation from "@/components/clips/ClipsNavigation";

type Clip = {
  id: string;
  slug: string;
  title: string;
  voteCount: number;
  thumbnailUrl: string;
  hasVoted: boolean;
  createdAt: Date;
  creator: string | null;
};

const ClipItem = ({
  clip,
  clipClicked,
  lastItemRef,
}: {
  clip: Clip;
  clipClicked: (clip: Clip) => void;
  lastItemRef: React.RefObject<HTMLDivElement>;
}) => {
  const { data: session } = useSession();

  const addVote = trpc.clips.addVote.useMutation({
    onSuccess: () => {
      setHasVoted(true);
      clip.voteCount++;
    },
  });

  const removeVote = trpc.clips.removeVote.useMutation({
    onSuccess: () => {
      setHasVoted(false);
      clip.voteCount--;
    },
  });

  const handleVote = (clipId: string) => {
    if (hasVoted) {
      removeVote.mutate({ clipId });
    } else {
      addVote.mutate({ clipId });
    }
  };

  const [hasVoted, setHasVoted] = useState(clip.hasVoted);
  const thumbsClass = hasVoted
    ? "hover:fill-alveus-green-900 fill-green"
    : "hover:fill-green fill:alveus-green-900";

  return (
    <div ref={lastItemRef}>
      <a className="group cursor-pointer" onClick={() => clipClicked(clip)}>
        <Image
          src={clip.thumbnailUrl}
          alt=""
          width={700}
          height={300}
          className="h-auto w-full rounded-xl transition group-hover:scale-102 group-hover:shadow-lg"
        />
        <div className="min-h-[4rem]">
          <p className="text-center text-xl font-medium transition-colors group-hover:text-alveus-green-700 ">
            {clip.title}
          </p>
        </div>
      </a>
      <div className="flex justify-between px-4">
        <p className="text-left">Votes: {clip.voteCount}</p>
        {session && (
          <button
            className={classes("cursor-pointer text-right", thumbsClass)}
            onClick={() => handleVote(clip.id)}
          >
            <IconThumbsUp size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

const ClipModal = ({
  clip,
  onClose,
}: {
  clip: Clip;
  onClose: (value: boolean) => void;
}) => {
  const clipUrl = new URL("https://clips.twitch.tv/embed");
  clipUrl.searchParams.set("clip", clip.slug);
  clipUrl.searchParams.set("parent", window.location.hostname);

  return (
    <Dialog
      open={true}
      onClose={() => onClose(false)}
      className="fixed inset-0 z-50 flex overflow-auto bg-black/75"
    >
      <Dialog.Panel className="relative m-auto flex max-h-[50vh] w-full flex-col rounded-lg border border-solid border-black bg-white px-2 pb-4 pt-10 sm:px-10 sm:py-10 md:max-w-[75vw] lg:max-h-[75vh] lg:max-w-[60vw] 2xl:max-w-[50vw]">
        <button
          className="absolute right-0 top-0 p-2"
          onClick={() => onClose(false)}
        >
          <svg
            className="h-6 w-6 cursor-pointer text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <Consent
          item={`twitch clip embed`}
          consent="twitch"
          className="alveus-twitch-embed rounded-2xl bg-alveus-green text-alveus-tan"
        >
          <iframe
            src={clipUrl + "&autoplay=true"}
            className="h-full w-full"
            allowFullScreen
          ></iframe>
        </Consent>
        <Dialog.Title className="mt-4 text-center text-xl lg:text-xl">
          {clip.title}
        </Dialog.Title>
        <div className="direction relative mx-auto flex-col px-4 text-center lg:mx-0 lg:flex lg:flex-row lg:text-left">
          <p className="lg:flex-1">Votes: {clip.voteCount}</p>
          <p className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:transform">
            Clipped on:{" "}
            <DateTime
              date={clip.createdAt}
              format={{ style: "short", timezone: false }}
            />
          </p>
          <p className="lg:flex-1 lg:text-right">Clipped by: {clip.creator}</p>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

const ClipsPage: NextPage = () => {
  const [sort, setSort] = useState<SortType>("top");
  const [currentModalClip, setCurrentModalClip] = useState<Clip | null>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const refLastSeen = useRef<HTMLDivElement | undefined>(undefined);

  const sortOptions = {
    top: "Top",
    top_7day: "Top (7 days)",
    top_30day: "Top (30 days)",
    new: "New",
  } as const satisfies Record<SortType, string>;

  const clips = trpc.clips.getClips.useInfiniteQuery(
    {
      sortBy: sort,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (refLastSeen.current) {
      scrollIntoView(refLastSeen.current, {
        behavior: "smooth",
        block: "center",
        scrollMode: "if-needed",
      });
      refLastSeen.current = undefined;
    }
  }, [clips.data]);

  const handleNext = useCallback(async () => {
    if (clips.hasNextPage && lastItemRef.current) {
      refLastSeen.current = lastItemRef.current;
      await clips.fetchNextPage();
    }
  }, [clips]);

  const closeModal = useCallback((value: boolean) => {
    setCurrentModalClip(null);
  }, []);

  const clipClicked = useCallback((clip: Clip) => {
    setCurrentModalClip(clip);
  }, []);

  const sortChanged = useCallback(
    (sort: SortType) => {
      setSort(sort);
      clips.remove();
    },
    [clips],
  );

  return (
    <>
      <Meta
        title="Clips"
        description="Explore and vote on Twitch clips from our community streams. Discover community-curated highlights and top moments."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-24"
        containerClassName="flex flex-wrap gap-4 justify-between"
      >
        <div className="w-full lg:w-3/5">
          <Heading>Alveus Clips</Heading>
          <p className="text-lg">
            Submit and vote for your favorite Alveus clips
          </p>
        </div>
        <ClipsNavigation />
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-60 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-64 2xl:max-w-[12rem]"
        />
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow pt-0">
          <div className="mb-4 mt-8 flex flex-col items-end">
            <Select
              options={sortOptions}
              value={sort}
              onChange={(value) => sortChanged(value as SortType)}
              label={<span className="sr-only">Sort by</span>}
              align="right"
              className="flex-shrink-0"
            />
          </div>
          {(clips.isRefetching || clips.isFetching) && (
            <div className="mt-16 text-center text-3xl font-bold">
              Loading...
            </div>
          )}
          <div className="mb-8 mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {!clips.isRefetching &&
              clips.data?.pages.flatMap((page) =>
                page.clips.map((clip) => (
                  <ClipItem
                    lastItemRef={lastItemRef}
                    key={clip.id}
                    clip={clip}
                    clipClicked={clipClicked}
                  />
                )),
              )}
          </div>
          {clips.hasNextPage && (
            <Button onClick={handleNext}>
              {clips.isFetchingNextPage ? (
                <>
                  <IconLoading size={20} /> Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          )}
        </Section>

        {currentModalClip && (
          <ClipModal onClose={closeModal} clip={currentModalClip} />
        )}
      </div>
    </>
  );
};

export default ClipsPage;
