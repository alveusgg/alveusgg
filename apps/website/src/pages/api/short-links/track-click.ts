import { track } from "@vercel/analytics/server";
import { z } from "zod";

import { trackShortLinkClick } from "@/server/db/short-links";
import { createTokenProtectedApiHandler } from "@/server/utils/api";

import { getAnalyticsHeaders } from "@/utils/analytics-headers";

const trackClickSchema = z.object({
  id: z.cuid(),
  slug: z.string(),
  link: z.string(),
  headers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});
export type TrackClickSchema = z.infer<typeof trackClickSchema>;

//API for short links tracking
export default createTokenProtectedApiHandler(
  trackClickSchema,
  async ({ id, slug, link, headers }) => {
    try {
      await trackShortLinkClick(id);
      await track(
        "Short link clicked",
        { slug, link },
        { headers: getAnalyticsHeaders(headers) },
      );
      return true;
    } catch (e) {
      console.error("Failed to track click", e);
      return false;
    }
  },
);
