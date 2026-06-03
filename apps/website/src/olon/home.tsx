import type { PageConfig } from "@olonjs/core/runtime";

import { RecentVideosContext, type RecentVideo } from "./components/recentVideos";
import { OlonPage } from "./OlonPage";

// The home silo (PageConfig) is read at runtime by the route's getStaticProps
// (src/pages/index.tsx) and passed in — NOT imported — so editing home.json is
// reflected with no rebuild. `videos` is the server-fetched RecentVideos data,
// provided to the RecentVideos island via context; the rest is editorial JSON sections.
export default function OlonHome({
  page,
  videos = [],
}: {
  page: PageConfig;
  videos?: RecentVideo[];
}) {
  return (
    <RecentVideosContext.Provider value={videos}>
      <OlonPage page={page} />
    </RecentVideosContext.Provider>
  );
}
