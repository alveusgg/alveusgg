import { type FC, useContext } from "react";

import RecentVideosSection, {
  type RecentVideo,
} from "@/components/content/RecentVideos";

import { RecentVideosContext } from "./context";
import type { RecentVideosData } from "./types";

// Live videos (from the route's getStaticProps, via context) always win. When
// none are available — e.g. local dev without a YOUTUBE_API_KEY — fall back to the
// sample videos baked into the silo JSON, but ONLY in development, so production
// behaves exactly as before (no live videos → section hidden). Renders the shared
// Alveus <RecentVideos>, same as the current home (mirrors Merch → MerchCarousel).
export const RecentVideos: FC<{ data: RecentVideosData }> = ({ data }) => {
  const live = useContext(RecentVideosContext);

  const fallback: RecentVideo[] =
    process.env.NODE_ENV !== "production"
      ? (data.videos ?? []).map((v) => ({
          ...v,
          published: new Date(v.published),
        }))
      : [];

  const videos = live.length > 0 ? live : fallback;

  return <RecentVideosSection heading={data.heading} videos={videos} />;
};
