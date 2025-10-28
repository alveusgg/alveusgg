import { motion } from "motion/react";
import { type NextPage } from "next";
import { useMemo } from "react";
import { z } from "zod";

import { classes } from "@/utils/classes";
import { formatDateTimeRelative } from "@/utils/datetime";
import { trpc } from "@/utils/trpc";

import useLocalStorage from "@/hooks/storage";
import { useTimestamp } from "@/hooks/timestamp";

import PixelsDescription from "@/components/institute/PixelsDescription";
import DonationProviderIcon from "@/components/shared/DonationProviderIcon";

import IconSearch from "@/icons/IconSearch";

function Donations() {
  const renderTime = useTimestamp();
  const entries = trpc.donations.getDonationsPublic.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 3000,
    },
  );

  const [showTimes, setShowTimes] = useLocalStorage(
    "stream/donation-feed/show-times",
    z.boolean(),
    false,
  );
  const [onlyPixels, setOnlyPixels] = useLocalStorage(
    "stream/donation-feed/only-pixels",
    z.boolean(),
    false,
  );

  const allDonations = entries.data?.pages.flatMap((page) => page.donations);

  // Filter donations if onlyPixels is true
  const filteredDonations = useMemo(() => {
    if (allDonations && onlyPixels) {
      return allDonations.filter((donation) => donation.pixels.length > 0);
    }
    return allDonations || [];
  }, [allDonations, onlyPixels]);

  return (
    <div className="w-full grow text-lg text-black">
      <div className="flex w-full flex-row border-b border-gray-400">
        <div className="grow p-2 text-center text-xl">
          <PixelsDescription />
        </div>

        <details className="relative">
          <summary className="cursor-pointer p-2 text-center text-lg font-bold">
            <IconSearch />
          </summary>
          <div className="absolute top-full right-0 z-10 mt-1 flex w-64 flex-col gap-2 rounded border border-gray-400 bg-white p-4 shadow-lg">
            <form>
              <input
                type="checkbox"
                id="showTimes"
                checked={showTimes}
                onChange={() => setShowTimes(!showTimes)}
              />
              <label htmlFor="showTimes" className="ml-2">
                Show Donation Times
              </label>
            </form>
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

      {filteredDonations.length === 0 && (
        <p className="p-4 text-center text-gray-600">
          No donations to display.
        </p>
      )}
      {filteredDonations.map((donation, i) => {
        const timeDiff = renderTime - donation.donatedAt.getTime();
        const isNow = timeDiff < 60 * 1000; // 1 minutes
        const isRecent = timeDiff < 10 * 60 * 1000; // 10 minutes

        const timeFormatted = formatDateTimeRelative(donation.donatedAt, {
          style: "short",
          time: "seconds",
        });

        const odd = i % 2 === 1;

        return (
          <motion.div
            key={donation.id}
            className={classes(
              "border-b border-gray-300 px-2 py-1",
              isNow && "text-red-800",
              !isNow && isRecent && "text-red-900",
            )}
            initial={
              isNow ? { backgroundColor: odd ? "#f5f5b2" : "#ffffbb" } : false
            }
            animate={{
              backgroundColor: odd ? "#f5f5f5" : "#ffffff",
            }}
            transition={{
              duration: 10,
            }}
          >
            <div className="flex flex-row items-center gap-2">
              <DonationProviderIcon
                className="size-3 shrink-0 text-gray-600"
                provider={donation.provider}
              />
              <div
                className={classes(
                  "shrink grow overflow-hidden text-nowrap text-ellipsis",
                  isNow && "font-bold",
                )}
              >
                {donation.identifier}
              </div>
              {donation.pixels.length > 0 && (
                <div className="text-right">
                  {donation.pixels.length.toLocaleString()}{" "}
                  {donation.pixels.length > 1 ? "pixels" : "pixel"}
                </div>
              )}
              <div className="min-w-24 shrink-0 text-right">
                ${(donation.amount / 100).toFixed(2)}
              </div>
            </div>
            {showTimes && <div>{timeFormatted}</div>}
          </motion.div>
        );
      })}
    </div>
  );
}

const DonationsPage: NextPage = () => {
  return (
    <div className="flex flex-col tabular-nums select-none">
      <Donations />
    </div>
  );
};

export default DonationsPage;
