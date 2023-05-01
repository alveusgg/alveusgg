import type { NextApiRequest, NextApiResponse } from "next";
import { runScheduledTasks } from "@/server/scheduler";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
