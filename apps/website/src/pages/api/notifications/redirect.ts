import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@alveusgg/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!req.url) {
    res.redirect(302, "/updates");
    res.end();
    return;
  }

  // Parse the partial URL (/api/...) to extract query parameters
  const params = new URL(req.url, "https://localhost/").searchParams;

  //const tag = params.get('notification_tag');
  //const action = params.get('notification_action');
  const notificationId = params.get("notification_id");

  if (!notificationId) {
    res.redirect(302, "/updates");
    res.end();
    return;
  }

  res.redirect(303, `/notifications/${encodeURIComponent(notificationId)}`);
  res.end();

  // Track click if possible
  const subscriptionId = params.get("subscription_id");
  if (subscriptionId) {
    await prisma.notificationPush.updateMany({
      where: { notificationId, subscriptionId, clickedAt: null },
      data: { clickedAt: new Date() },
    });
  }
}
