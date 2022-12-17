import type { NextApiRequest, NextApiResponse } from "next";

import { updateSubscriptions } from "../../../server/tasks/manage-twitch-subscriptions";

async function runScheduledTasks() {
  await updateSubscriptions();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;

      if (authorization === `Bearer ${process.env.CRON_SCHEDULER_API_SECRET}`) {
        await runScheduledTasks();
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false });
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        message: err instanceof Error ? err.message : "unknown error",
      });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
