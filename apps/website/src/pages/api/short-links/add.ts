import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";
import { env } from "@/env/index.mjs";

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
      const clicks: number = query.clicks + 1;

      const tracker = await prisma.shortLinksTracking.update({
        where: { id: id },
        data: {
          clicks: clicks,
        },
      });
      res.status(204).send("");
    }
  } else {
    res.status(403).send("Unauthorized");
  }
}
