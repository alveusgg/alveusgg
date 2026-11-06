/**
 * Stream overlay page — add this URL as a Browser Source in OBS/Streamlabs.
 * Transparent background, polls for new donations, pops up an animated
 * alert card for ~8 seconds whenever a new wishlist donation comes in.
 *
 * OBS setup:
 *   1. Add a new "Browser Source"
 *   2. URL: https://www.alveussanctuary.org/overlay/wishlist-alerts
 *   3. Width: 800, Height: 300 (or to taste)
 *   4. Check "Shutdown source when not visible" OFF (keep it always polling)
 */

import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";

import { trpc } from "@/utils/trpc";
import Meta from "@/components/content/Meta";

interface AlertItem {
  id: string;
  donorName: string | null;
  amount: number;
  itemTitle: string;
}

const ALERT_DURATION_MS = 8000;
const POLL_INTERVAL_MS = 5000;

const OverlayPage: NextPage = () => {
  const [queue, setQueue] = useState<AlertItem[]>([]);
  const [current, setCurrent] = useState<AlertItem | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  const recentQuery = trpc.adminWishlist.adminGetDonations.useQuery(
    { status: "CAPTURED" },
    { refetchInterval: POLL_INTERVAL_MS }
  );

  useEffect(() => {
    if (!recentQuery.data) return;

    if (isFirstLoad.current) {
      recentQuery.data.forEach((d) => seenIds.current.add(d.id));
      isFirstLoad.current = false;
      return;
    }

    const fresh = recentQuery.data.filter((d) => !seenIds.current.has(d.id));
    if (fresh.length === 0) return;

    fresh.forEach((d) => seenIds.current.add(d.id));

    setQueue((prev) => [
      ...prev,
      ...fresh.map((d) => ({
        id: d.id,
        donorName: d.donorName,
        amount: d.capturedAmount ?? d.amount,
        itemTitle: d.wishlistItem?.title ?? "a wishlist item",
      })),
    ]);
  }, [recentQuery.data]);

  // Pop the next queued alert into `current` when nothing is showing.
  // Deliberately does NOT start the dismiss timer here — see below.
  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrent(next ?? null);
    setQueue(rest);
  }, [current, queue]);

  // Auto-dismiss the currently showing alert. This is a SEPARATE effect,
  // keyed only on `current` — not `[current, queue]` like the effect
  // above. If this timer lived in the same effect that sets `current`,
  // the state change would immediately re-run that effect (since `current`
  // is in its own dependency array), tearing down this timer via its
  // cleanup function before it ever had a chance to fire, leaving the
  // first alert stuck on screen permanently.
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => setCurrent(null), ALERT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <>
      <Meta title="Wishlist Donation Alerts" noindex />
      <div style={{
        margin: 0,
        width: "100vw",
        height: "100vh",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        {current && (
          <div
            key={current.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "linear-gradient(135deg, #0f6e56, #0a5443)",
              borderRadius: 20,
              padding: "20px 32px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              animation: "alertPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              maxWidth: 700,
            }}
          >
            <div style={{ fontSize: 44 }}>🎁</div>
            <div>
              <p style={{ margin: 0, color: "#bdf5e3", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
                New Wishlist Donation
              </p>
              <p style={{ margin: "4px 0 0", color: "white", fontSize: 26, fontWeight: 700 }}>
                {current.donorName?.trim() || "Anonymous"} donated ${current.amount.toFixed(2)}
              </p>
              <p style={{ margin: "2px 0 0", color: "#bdf5e3", fontSize: 16 }}>
                toward {current.itemTitle}
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes alertPop {
          0% { transform: scale(0.7) translateY(20px); opacity: 0; }
          60% { transform: scale(1.05) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        body { margin: 0; background: transparent; }
      `}</style>
    </>
  );
};

export default OverlayPage;
