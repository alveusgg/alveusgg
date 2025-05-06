import heicDecode from "heic-decode";
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
    const imageBuffer = await getRawBody(req);

    let processedImage: Buffer;

    if (
      contentType.includes("image/heic") ||
      contentType.includes("image/heif")
    ) {
      try {
        const { width, height, data } = await heicDecode({
          buffer: imageBuffer,
        });

        processedImage = await sharp(Buffer.from(data), {
          raw: {
            width,
            height,
            channels: 4,
          },
        })
          .jpeg({ quality: 90 })
          .toBuffer();
      } catch (heicError) {
        console.error("HEIC decode error:", heicError);
        return res.status(500).json({ error: "HEIC decode failed" });
      }
    } else {
      processedImage = await sharp(imageBuffer)
        .jpeg({ quality: 90 })
        .toBuffer();
    }

    res.setHeader("Content-Type", `image/jpeg`);
    res.status(200).send(processedImage);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Invalid request" });
  }
}
