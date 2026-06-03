import { z } from "zod";

import { BaseSectionData } from "@/olon/lib/base-schemas";

// The heading is editorial. `videos` is an OPTIONAL fallback, used only when no
// live videos are available (e.g. local dev without a YOUTUBE_API_KEY); in normal
// operation the videos are dynamic, supplied via context by the route.
// `published` is an ISO date string here (JSON); the View converts it to a Date.
export const recentVideosSchema = BaseSectionData.extend({
  heading: z.string().describe("ui:text"),
  videos: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        published: z.string(),
        author: z.object({ name: z.string(), uri: z.string() }),
      }),
    )
    .optional(),
});
