// Wishlist donation alerts, added to OBS as a Browser Source:
// https://www.alveussanctuary.org/stream/wishlist
import { AnimatePresence, motion } from "motion/react";
import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";

import { trpc } from "@/utils/trpc";

import IconGift from "@/icons/IconGift";

interface AlertItem {
  id: string;
  donorName: string | null;
  amount: number;
  itemTitle: string;
}

const ALERT_DURATION_MS = 8000;
const POLL_INTERVAL_MS = 5000;

const WishlistOverlayPage: NextPage = () => {
  const [queue, setQueue] = useState<AlertItem[]>([]);
  const [current, setCurrent] = useState<AlertItem | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  const recentQuery = trpc.wishlist.getRecentDonationAlerts.useQuery(
    undefined,
    { refetchInterval: POLL_INTERVAL_MS },
  );

  // Queue donations we haven't seen yet. The first response only marks the
  // existing donations as seen, so a reload doesn't replay old alerts.
  useEffect(() => {
    if (!recentQuery.data) return;

    const fresh = recentQuery.data.filter((d) => !seenIds.current.has(d.id));
    fresh.forEach((d) => seenIds.current.add(d.id));

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (fresh.length > 0) setQueue((prev) => [...prev, ...fresh.reverse()]);
  }, [recentQuery.data]);

  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrent(next ?? null);
    setQueue(rest);
  }, [current, queue]);

  // Dismiss the current alert. This is a separate effect keyed only on
  // `current`, so setting `current` above doesn't clear this timer.
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => setCurrent(null), ALERT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ ease: "anticipate", duration: 0.5 }}
            className="flex max-w-3xl items-center gap-6 rounded-2xl bg-alveus-green px-8 py-5 text-alveus-tan shadow-2xl"
          >
            <IconGift className="size-14 shrink-0" />
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase opacity-75">
                New wishlist donation
              </p>
              <p className="font-serif text-3xl font-bold">
                {current.donorName?.trim() || "Anonymous"} donated $
                {current.amount.toFixed(2)}
              </p>
              <p className="text-lg">toward {current.itemTitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishlistOverlayPage;
