import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/server/db/client";

const trackClickSchema = z.object({ id: z.string().cuid() });
export type TrackClickSchema = z.infer<typeof trackClickSchema>;

//API for short links tracking
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = JSON.parse(req.body);
  const id = body.id;
  if (body.secret === env.SHORT_LINKS_TRACKING_SECRET) {
    const query = await prisma.shortLinksTracking.findFirst({
      where: { id: id },
    });
    if (query) {
      await prisma.shortLinksTracking.update({
        where: { id: id },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
      res.status(204).send("");
    }
  } else {
    res.status(403).send("Unauthorized");
  }
}
