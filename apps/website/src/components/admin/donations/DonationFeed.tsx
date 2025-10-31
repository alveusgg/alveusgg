import { Fragment, useCallback, useEffect, useState } from "react";
import { z } from "zod";

import { trpc } from "@/utils/trpc";

import useLocalStorage from "@/hooks/storage";

import { LoadMoreTrigger } from "@/components/LoadMoreTrigger";

import IconFunnel from "@/icons/IconFunnel";

import DonationFeedItem from "./DonationFeedItem";

const nullableDateSchema = z.coerce.date().nullable();
const boolSchema = z.boolean();

export function DonationFeed() {
  const [onlyPixels, setOnlyPixels] = useLocalStorage(
    "stream/donation-feed/only-pixels",
    boolSchema,
    false,
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
      refetchInterval: 5_000,
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
    <div className="w-full text-lg tabular-nums select-none">
      <div className="flex w-full flex-row gap-2 border-t border-b border-gray-400 px-2">
        <div className="grow text-center text-xl">
          {/* <PixelsDescription /> */}
        </div>

        <details className="relative">
          <summary className="cursor-pointer p-2 text-center text-lg font-bold">
            <IconFunnel />
          </summary>
          <div className="absolute top-full right-0 z-10 flex w-64 flex-col gap-2 rounded border border-gray-400 bg-white p-4 text-black shadow-lg">
            <form>
              <input
                type="checkbox"
                id="onlyPixels"
                checked={onlyPixels}
                onChange={() => setOnlyPixels(!onlyPixels)}
              />
              <label htmlFor="onlyPixels" className="ml-2">
                Only pixel donations
              </label>
            </form>
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
