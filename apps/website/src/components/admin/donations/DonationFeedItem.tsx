import { DateTime } from "luxon";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import type { DonationFeed } from "@/server/trpc/router/donations";

import { classes } from "@/utils/classes";
import { type DateTimeOptions } from "@/utils/datetime";

import { useTimestamp } from "@/hooks/timestamp";

import DonationProviderIcon from "@/components/shared/DonationProviderIcon";

import IconCheck from "@/icons/IconCheck";
import IconPhoto from "@/icons/IconPhoto";

const timeAgo = (
  date: Date,
  { zone = "UTC" }: Partial<DateTimeOptions> = {},
) => {
  const now = DateTime.now().setZone(zone ?? undefined);
  const dt = DateTime.fromJSDate(date).setZone(zone ?? undefined);

  const diff = now
    .diff(dt, ["years", "months", "days", "hours", "minutes", "seconds"])
    .toObject();

  if (diff.years && diff.years >= 1) return `${Math.floor(diff.years)}y`;
  if (diff.days && diff.days >= 1) return `${Math.floor(diff.days)}d`;
  if (diff.hours && diff.hours >= 1) return `${Math.floor(diff.hours)}h`;
  if (diff.minutes && diff.minutes >= 1) return `${Math.floor(diff.minutes)}m`;
  const seconds = Math.floor(diff.seconds ?? 0);
  return seconds < 20 ? "now" : `${seconds}s`;
};

const formatDonationAmount = (amount: number) =>
  Math.round(amount / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    unitDisplay: "narrow",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

type Donation = DonationFeed[number];

function Badge({
  icon,
  children,
  className,
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classes(
        "flex flex-row items-center gap-2 rounded-lg px-2 py-0.5 text-white",
        className,
      )}
    >
      <div className="shrink-0">{icon}</div>
      <div>{children}</div>
    </div>
  );
}

function DonationFeedItem({
  donation,
  odd,
  lastSeen,
  setLastSeen,
}: {
  donation: Donation;
  lastSeen: Date | null;
  setLastSeen: (date: Date | null) => void;
  odd: boolean;
}) {
  const renderTime = useTimestamp(10_000);
  const timeDiff = renderTime - donation.donatedAt.getTime();
  const isNow = timeDiff < 60 * 1000; // 1 minutes
  const isRecent = timeDiff < 10 * 60 * 1000; // 10 minutes

  const timeFormatted = timeAgo(donation.donatedAt);

  return (
    <motion.div
      key={donation.id}
      className={classes(
        "group border-b border-gray/50 px-2 py-1",
        isNow && "text-red-800",
        !isNow && isRecent && "text-red-900",
      )}
      initial={
        isNow
          ? {
              backgroundColor: odd
                ? "rgba(0, 0, 100, 0.2)"
                : "rgba(50, 50, 100, 0.2)",
            }
          : false
      }
      animate={{
        backgroundColor: odd ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0)",
      }}
      transition={{
        duration: 10,
      }}
    >
      <div className="flex flex-row items-center gap-2">
        <button
          className="w-6"
          onClick={() => setLastSeen(donation.donatedAt)}
          title="Mark as seen"
        >
          {lastSeen !== null && donation.donatedAt <= lastSeen ? (
            <IconCheck />
          ) : (
            "·"
          )}
        </button>

        <Badge
          className="bg-carnival"
          icon={
            <DonationProviderIcon
              className="size-3"
              provider={donation.provider}
            />
          }
        >
          {formatDonationAmount(donation.amount)}
        </Badge>
        {donation.pixels > 0 && (
          <Badge
            className="bg-alveus-green-900"
            icon={<IconPhoto className="size-6" />}
          >
            {donation.pixels.toLocaleString()}
          </Badge>
        )}
        <div
          className={classes(
            "shrink grow overflow-hidden text-nowrap text-ellipsis",
            isNow && "font-bold",
          )}
        >
          {donation.identifier}
        </div>
        <div className="text-right">{timeFormatted}</div>
      </div>
      {donation.note ? (
        <div className="text-md ml-6 overflow-hidden px-2 py-1 text-ellipsis whitespace-nowrap text-black/80 italic group-hover:whitespace-normal dark:text-white/80">
          {donation.note}
        </div>
      ) : null}
    </motion.div>
  );
}

export default DonationFeedItem;
