import { z } from "zod";
import { prisma } from "@/server/db/client";
import { createTokenProtectedApiHandler } from "@/server/utils/api";

const trackClickSchema = z.object({ id: z.string().cuid() });
export type TrackClickSchema = z.infer<typeof trackClickSchema>;

//API for short links tracking
export default createTokenProtectedApiHandler(
  trackClickSchema,
  async (options) => {
    try {
      await prisma.shortLinksTracking.upsert({
        where: { id: options.id },
        create: { id: options.id, clicks: 1 },
        update: { clicks: { increment: 1 } },
      });
      return true;
    } catch (e) {
      console.error("Failed to track click", e);
      return false;
    }
  },
);
