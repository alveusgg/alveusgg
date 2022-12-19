import type { NextApiRequest, NextApiResponse } from "next";
import { sendNotification } from "../../../server/actions/send-notification";
import { z } from "zod";

const notificationRequestBodySchema = z.object({
  tag: z.string(),
  text: z.string(),
  url: z.string().url(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;

      if (authorization === `Bearer ${process.env.ACTION_API_SECRET}`) {
        if (req.body) {
          const options = notificationRequestBodySchema.safeParse(req.body);

          if (options.success) {
            try {
              await sendNotification(options.data);
              res
                .status(200)
                .json({ success: true, message: "notification sent!" });
            } catch (e) {
              console.error(e);
              res
                .status(400)
                .json({ success: false, error: "failed to send notification" });
            }
          } else {
            res.status(400).json({ success: false, error: options.error });
          }
        } else {
          res.status(400).json({ success: false, error: "body missing" });
        }
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
