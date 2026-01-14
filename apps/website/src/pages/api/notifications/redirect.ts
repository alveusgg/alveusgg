import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@alveusgg/database";

import { getNotificationVod } from "@/utils/notifications";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!req.url) {
    res.redirect(404, "/");
    res.end();
    return;
  }

  // Parse the partial URL (/api/...) to extract query parameters
  const params = new URL(req.url, "https://localhost/").searchParams;

  //const tag = params.get('notification_tag');
  //const action = params.get('notification_action');
  const notificationId = params.get("notification_id");

  if (!notificationId) {
    res.redirect(404, "/");
    res.end();
    return;
  }

  // Redirect
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  // We still redirect if the notification is expired, but not if it was canceled
  if (notification === null || notification.canceledAt !== null) {
    res.redirect(404, "/");
    res.end();
    return;
  }

  res.redirect(
    303,
    getNotificationVod(notification) || notification.linkUrl || "/",
  );
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
