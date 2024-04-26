import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

//API for short links middleware function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = JSON.parse(req.body);

  const shortLink = await prisma.shortLinks.findFirst({
    where: { slug: body.slug },
  });
  res.status(200).json(shortLink);
}
