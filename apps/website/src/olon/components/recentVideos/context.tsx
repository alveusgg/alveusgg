import { createContext } from "react";

import type { RecentVideo } from "@/components/content/RecentVideos";

// Dynamic server data (latest YouTube videos) provided by the home route's
// getStaticProps and consumed by the RecentVideos island View — the data does
// not live in the silo JSON (it's dynamic, not editorial). The shape is owned
// by the shared Alveus <RecentVideos> component (single source of truth).
export type { RecentVideo };

export const RecentVideosContext = createContext<RecentVideo[]>([]);
