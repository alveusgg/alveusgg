import * as OneSignal from "@onesignal/node-onesignal";

export async function sendNotification(text: string) {
  const appKey = process.env.ONESIGNAL_REST_API_KEY;
  const appId = process.env.ONESIGNAL_APP_ID;

  if (appKey === undefined) {
    throw Error("OneSignal API Key missing!");
  }
  if (appId === undefined) {
    throw Error("OneSignal APP id missing!");
  }

  const configuration = OneSignal.createConfiguration({
    authMethods: {
      app_key: {
        tokenProvider: {
          getToken() {
            return appKey;
          },
        },
      },
    },
  });

  const client = new OneSignal.DefaultApi(configuration);

  console.log(client);

  const notification = new OneSignal.Notification();
  notification.app_id = appId;
  notification.filters = [];
  notification.chrome_web_image =
    "https://static-cdn.jtvnw.net/jtv_user_pictures/4384f6c4-6608-48f4-b3a7-36d0eb6efbd3-profile_image-300x300.png";
  notification.chrome_web_icon =
    "https://static-cdn.jtvnw.net/jtv_user_pictures/4384f6c4-6608-48f4-b3a7-36d0eb6efbd3-profile_image-300x300.png";
  notification.chrome_web_badge =
    "https://static-cdn.jtvnw.net/jtv_user_pictures/4384f6c4-6608-48f4-b3a7-36d0eb6efbd3-profile_image-300x300.png";

  notification.contents = {
    en: text,
  };

  notification.headings = {
    en: text,
  };

  await client.createNotification(notification);
}
