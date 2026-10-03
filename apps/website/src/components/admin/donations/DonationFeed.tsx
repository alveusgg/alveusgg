import { Fragment, useCallback, useEffect, useState } from "react";
import { z } from "zod";

import murals from "@/data/murals";

import { typeSafeObjectKeys } from "@/utils/helpers";
import { trpc } from "@/utils/trpc";

import useLocaleString from "@/hooks/locale";
import { PixelProvider, usePixels } from "@/hooks/pixels";
import { usePrependScrollLock } from "@/hooks/prepend-scroll-lock";
import useLocalStorage from "@/hooks/storage";
import useUrlOption from "@/hooks/url-option";

import { LoadMoreTrigger } from "@/components/LoadMoreTrigger";

import IconFunnel from "@/icons/IconFunnel";

import DonationFeedItem from "./DonationFeedItem";

const newestMuralId = typeSafeObjectKeys(murals).at(-1);

const nullableDateSchema = z.coerce.date().nullable();

function PixelsCount() {
  return (
    <p className="tabular-nums">
      {useLocaleString(usePixels()?.length ?? 0)} pixels unlocked
    </p>
  );
}

export function DonationFeed() {
  const [onlyPixels, setOnlyPixels] = useUrlOption(
    "stream/donation-feed/only-pixels",
    "pixels",
    false,
  );
  const [showNotes, setShowNotes] = useUrlOption(
    "stream/donation-feed/show-notes",
    "notes",
    true,
  );
  const [lastSeen, setLastSeen] = useLocalStorage(
    "stream/donation-feed/last-seen",
    nullableDateSchema,
    null,
  );
  const [initialLastShown, setInitialLastShown] = useState<Date | null>(null);
  const [, setLastShown] = useLocalStorage(
    "stream/donation-feed/last-shown",
    nullableDateSchema,
    null,
    useCallback(
      (val: Date | null) => {
        setInitialLastShown(val);
      },
      [setInitialLastShown],
    ),
  );

  const donationsQuery = trpc.donations.getDonationFeed.useInfiniteQuery(
    {
      onlyPixels,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 2_000,
    },
  );

  const newestDonation = donationsQuery.data?.pages[0]?.donations[0];
  useEffect(() => {
    if (newestDonation) setLastShown(newestDonation.donatedAt);
  }, [newestDonation, setLastShown]);

  const donations =
    donationsQuery.data?.pages.flatMap((page) => page.donations) ?? [];

  const lastShownDonation = donations.find(
    (donation) =>
      initialLastShown !== null && donation.donatedAt <= initialLastShown,
  );

  usePrependScrollLock(donations.length);

  const onLoadMore = useCallback(() => {
    if (
      !donationsQuery.isLoading &&
      !donationsQuery.isFetchingNextPage &&
      donationsQuery.data &&
      donationsQuery.hasNextPage
    ) {
      donationsQuery.fetchNextPage();
    }
  }, [donationsQuery]);

  return (
    <div className="w-full tabular-nums">
      <div className="flex w-full flex-row items-center gap-2 border-y border-gray-400 px-2">
        <div className="grow text-center">
          {newestMuralId ? (
            <PixelProvider muralId={newestMuralId}>
              <PixelsCount />
            </PixelProvider>
          ) : null}
        </div>

        <details className="relative">
          <summary className="cursor-pointer p-2 text-center text-lg font-bold">
            <IconFunnel />
          </summary>
          <div className="absolute top-full right-0 z-10 flex w-64 flex-col gap-2 rounded-sm border border-gray-400 bg-white p-4 text-black shadow-lg">
            <form className="flex flex-col gap-2">
              <div>
                <input
                  type="checkbox"
                  id="onlyPixels"
                  checked={onlyPixels}
                  onChange={() => setOnlyPixels(!onlyPixels)}
                />
                <label htmlFor="onlyPixels" className="ml-2">
                  Only pixel donations
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="showNotes"
                  checked={showNotes}
                  onChange={() => setShowNotes(!showNotes)}
                />
                <label htmlFor="showNotes" className="ml-2">
                  Show donation notes
                </label>
              </div>
            </form>
            <p className="text-xs text-gray-600">
              Options can also be set via the URL, e.g.{" "}
              <code>{"?pixels=1&notes=0&theme=dark"}</code>
            </p>
          </div>
        </details>
      </div>
      <div className="min-h-screen">
        {donationsQuery.isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading donations...
          </div>
        ) : (
          donations.length === 0 && (
            <p className="p-4 text-center text-gray-600">
              No donations to display.
            </p>
          )
        )}

        {donations.map((donation, i) => {
          const item = (
            <DonationFeedItem
              key={donation.id}
              donation={donation}
              odd={i % 2 === 0}
              showNotes={showNotes}
              lastSeen={lastSeen}
              setLastSeen={setLastSeen}
            />
          );

          if (i > 0 && donation.id === lastShownDonation?.id) {
            return (
              <Fragment key={donation.id}>
                <div className="bg-gray-600 p-1 text-center text-sm text-white italic">
                  <div>– Seen before –</div>
                </div>
                {item}
              </Fragment>
            );
          }

          return item;
        })}
      </div>
      <LoadMoreTrigger onLoadMore={onLoadMore} />
    </div>
  );
}
