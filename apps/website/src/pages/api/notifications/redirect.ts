import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "../../../server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.url) {
    res.send(404);
    res.redirect("/");
    return;
  }

  const url = new URL(req.url, "https://localhost/"); // FIXME: Trick JS to parse the partial URL /api/...
  const params = url.searchParams;

  //const tag = params.get('notification_tag');
  //const action = params.get('notification_action');
  const notificationId = params.get("notification_id");
  const subscriptionId = params.get("subscription_id");

  if (!notificationId) {
    res.send(404);
    res.redirect("/");
    return;
  }

  // Redirect
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (notification) {
    res.send(303);
    res.redirect(notification.linkUrl || "/");
  }

  // Track click if possible
  if (subscriptionId) {
    await prisma.notificationPush.updateMany({
      where: { notificationId, subscriptionId, clickedAt: null },
      data: { clickedAt: new Date() },
    });
  }
}
