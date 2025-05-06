import type { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import sharp from "sharp";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("/image")) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const outputFormat = (req.body.outputFormat as string) || "jpeg";
    if (!["jpeg", "webp", "png"].includes(outputFormat)) {
      return res.status(400).json({ error: "Invalid output format" });
    }

    const imageBuffer = await getRawBody(req);

    const processedImage = await sharp(imageBuffer).toFormat("jpeg").toBuffer();

    res.setHeader("Content-Type", `image/${outputFormat}`);
    res.status(200).send(processedImage);
  } catch (error) {
    return res.status(400).json({ error: "Invalid request" });
  }
}
