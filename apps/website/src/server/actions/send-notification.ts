import * as OneSignal from "@onesignal/node-onesignal";
import { getNotificationTags } from "../../config/notifications";
import { env } from "../../env/server.mjs";

export async function sendNotification(data: {
  tag: string;
  text: string;
  url: string;
  heading?: string;
}) {
  const appKey = env.ONESIGNAL_REST_API_KEY;
  const appId = env.ONESIGNAL_APP_ID;

  if (appKey === undefined) {
    throw Error("OneSignal API Key missing!");
  }
  if (appId === undefined) {
    throw Error("OneSignal APP id missing!");
  }

  const allowedTags = await getNotificationTags();
  if (!allowedTags.includes(data.tag)) {
    throw Error("Notification tag unknown!");
  }

  const configuration = OneSignal.createConfiguration({
    authMethods: {
      app_key: {
        tokenProvider: {
          getToken: () => appKey,
        },
      },
      user_key: undefined,
    },
  });
  console.log(configuration.authMethods.app_key);
  const client = new OneSignal.DefaultApi(configuration);

  const notification = new OneSignal.Notification();
  notification.app_id = appId;
  notification.filters = [
    { field: "tag", key: data.tag, relation: "=", value: "1" },
  ];
  notification.chrome_web_icon = "https://www.alveus.gg/apple-touch-icon.png";
  notification.chrome_web_badge =
    "https://www.alveus.gg/notification-badge.png";
  notification.chrome_web_image =
    "https://static-cdn.jtvnw.net/jtv_user_pictures/4384f6c4-6608-48f4-b3a7-36d0eb6efbd3-profile_image-300x300.png";

  notification.contents = {
    en: data.text,
  };

  notification.headings = {
    en: data.heading || data.text,
  };

  const { id } = await client.createNotification(notification);
  return id;
}
