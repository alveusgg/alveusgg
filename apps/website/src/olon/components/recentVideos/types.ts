import type { z } from "zod";

import type { recentVideosSchema } from "./schema";

export type RecentVideosData = z.infer<typeof recentVideosSchema>;
