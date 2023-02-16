import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { sendNotification } from "../../../server/actions/send-notification";
import { env } from "../../../env/server.mjs";

const notificationRequestBodySchema = z.object({
  tag: z.string(),
  text: z.string(),
  url: z.string().url(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  try {
    const { authorization } = req.headers;

    if (authorization !== `Bearer ${env.ACTION_API_SECRET}`) {
      res.status(401).json({ success: false });
      return;
    }

    if (!req.body) {
      res.status(400).json({ success: false, error: "body missing" });
      return;
    }

    const options = notificationRequestBodySchema.safeParse(req.body);
    if (!options.success) {
      res.status(400).json({ success: false, error: options.error });
      return;
    }

    try {
      await sendNotification(options.data);
      res.status(200).json({ success: true, message: "notification sent!" });
    } catch (e) {
      console.error(e);
      res
        .status(400)
        .json({ success: false, error: "failed to send notification" });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err instanceof Error ? err.message : "unknown error",
    });
  }
}
