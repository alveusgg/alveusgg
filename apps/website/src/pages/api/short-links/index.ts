import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

//API for short links middleware function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const shortLinks = await prisma.shortLinks.findMany();
  res.status(200).json(shortLinks);
}
