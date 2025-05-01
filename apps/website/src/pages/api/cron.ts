import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "@/env";

import { runScheduledTasks } from "@/server/scheduler";
import timingSafeCompareString from "@/server/utils/timing-safe-compare-string";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check for secret to confirm this is a valid request
  const { authorization } = req.headers;
  if (
    env.CRON_SECRET &&
    (authorization === undefined ||
      !timingSafeCompareString(authorization, `Bearer ${env.CRON_SECRET}`))
  ) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    await runScheduledTasks();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err instanceof Error ? err.message : "unknown error",
    });
  }
}
