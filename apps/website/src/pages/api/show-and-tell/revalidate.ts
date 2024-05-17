import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/env";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== env.ACTION_API_SECRET) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    // revalidate index page
    await res.revalidate("/show-and-tell");

    return res.json({ revalidated: true });
  } catch (err) {
    console.error("Error revalidating show and tell posts", err);
  }

  return res.status(500).send("Error revalidating");
}
