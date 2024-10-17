import { z } from "zod";
import { track } from "@vercel/analytics/server";

import { prisma } from "@/server/db/client";
import { createTokenProtectedApiHandler } from "@/server/utils/api";

const trackClickSchema = z.object({
  id: z.string().cuid(),
  slug: z.string(),
  link: z.string(),
});
export type TrackClickSchema = z.infer<typeof trackClickSchema>;

//API for short links tracking
export default createTokenProtectedApiHandler(
  trackClickSchema,
  async ({ id, slug, link }) => {
    try {
      await prisma.shortLinksTracking.upsert({
        where: { id },
        create: { id, clicks: 1 },
        update: { clicks: { increment: 1 } },
      });
      await track("Short link clicked", { id, slug, link });
      return true;
    } catch (e) {
      console.error("Failed to track click", e);
      return false;
    }
  },
);
