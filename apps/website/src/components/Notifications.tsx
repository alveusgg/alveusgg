import { useSession } from "next-auth/react";
import Script from "next/script";
import { useEffect, useId, useState } from "react";

export const Notifications: React.FC = () => {
  const id = useId();
  const { data: sessionData } = useSession();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !sessionData) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(function () {
      OneSignal.setExternalUserId(sessionData.user?.id);
      OneSignal.init({
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
        subdomain: process.env.NEXT_PUBLIC_ONESIGNAL_SUBDOMAIN || undefined,
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
        notifyButton: {
          enable: true,
        },
      });
      OneSignal.sendTag("foo", "bar").then(function (tagsSent: any) {
        // Callback called when tags have finished sending
        console.log({ tagsSent });
      });
    });
  }, [id, scriptLoaded, sessionData]);

  return (
    <Script
      src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"
      strategy="lazyOnload"
      onLoad={() => {
        setScriptLoaded(true);
      }}
    />
  );
};
