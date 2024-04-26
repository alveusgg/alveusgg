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
  const id = req.body.id;
  await prisma.shortLinksTracking.upsert({
    where: { id: id },
    create: { id, clicks: 1 },
    update: { clicks: { increment: 1 } },
  });
  res.status(204).send("");
}
