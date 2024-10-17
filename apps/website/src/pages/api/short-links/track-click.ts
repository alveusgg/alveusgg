import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { track } from "@vercel/analytics/server";

import { prisma } from "@/server/db/client";

const trackClickSchema = z.object({
  id: z.string().cuid(),
  slug: z.string(),
  link: z.string(),
});
export type TrackClickSchema = z.infer<typeof trackClickSchema>;

//API for short links tracking
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id, slug, link } = req.body;
  await prisma.shortLinksTracking.upsert({
    where: { id: id },
    create: { id, clicks: 1 },
    update: { clicks: { increment: 1 } },
  });
  await track("Short link clicked", { id, slug, link });
  res.status(204).send("");
}
