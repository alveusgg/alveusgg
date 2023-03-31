import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@planetscale/database";

export const config = {
  runtime: "edge",
};

const db = new Client({ url: process.env.DATABASE_URL });

const headers = {
  "content-type": "application/json;charset=UTF-8",
  "access-control-allow-origin": "*",
  "cache-control": "max-age=30, public, s-maxage=5, stale-while-revalidate=59",
};

export default async function OverlayStatus(
  _req: NextApiRequest,
  _res: NextApiResponse
) {
  const conn = db.connection();
  try {
    const { rows } = await conn.execute(
      "SELECT `alveusgg`.`ExtensionStatus`.`data` FROM `alveusgg`.`ExtensionStatus` WHERE `alveusgg`.`ExtensionStatus`.`channelId` = ? AND `alveusgg`.`ExtensionStatus`.`extension` = ?",
      [235835559, "AlveusAmbassadors"]
    );

    const data = rows[0];
    if (!data)
      return new Response('{"error": "no status"}', {
        headers,
      });

    return new Response((data as { data: string }).data, { headers });
  } catch (e) {}

  return new Response('{"error": "could not get status"}', {
    headers,
  });
}
