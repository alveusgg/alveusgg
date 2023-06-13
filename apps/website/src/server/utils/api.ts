import type { NextApiRequest, NextApiResponse } from "next";
import type { ZodType } from "zod/lib/types";
import type { z } from "zod";
import { env } from "@/env/server.mjs";

export function createTokenProtectedApiHandler<T extends ZodType>(
  schema: T,
  action: (options: z.infer<T>) => Promise<boolean>
) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.status(405).end("Method Not Allowed");
      return;
    }

    const { authorization } = req.headers;

    if (authorization !== `Bearer ${env.ACTION_API_SECRET}`) {
      res.status(401).json({ success: false });
      return;
    }

    if (!req.body) {
      console.error("body missing");
      res.status(400).json({ success: false, error: "body missing" });
      return;
    }

    const options = schema.safeParse(req.body);
    if (!options.success) {
      console.error("parse error", options.error);
      res.status(400).json({ success: false, error: options.error });
      return;
    }

    let success = false;
    try {
      success = await action(options.data);
    } catch (e) {}

    res.status(success ? 200 : 500).json({ success });
  };
}
