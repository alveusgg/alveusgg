import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "@/env";

import { runScheduledTasks } from "@/server/scheduler";
import timingSafeCompareString from "@/server/utils/timing-safe-compare-string";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Without a secret anyone could trigger the scheduled tasks, so only allow
  // that outside of production (e.g. for local development)
  if (!env.CRON_SECRET && env.NODE_ENV === "production") {
    console.error("[cron] CRON_SECRET is not set, not running scheduled tasks");
    return res.status(500).json({ message: "Cron secret not configured" });
  }

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
