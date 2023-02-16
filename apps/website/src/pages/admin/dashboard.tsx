import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";

import { getNotificationsConfig } from "../../config/notifications";
import type { TwitchConfig } from "../../config/twitch";
import { getChannelConfigById, getTwitchConfig } from "../../config/twitch";
import { checkIsSuperUser } from "../../utils/auth";
//import { getSubscriptions } from "../../utils/twitch-api";
import { Headline } from "../../components/shared/Headline";
import { SendNotificationForm } from "../../components/admin/SendNotificationForm";
import { Giveaways } from "../../components/admin/Giveaways";
import { AdminPageLayout } from "../../components/admin/AdminPageLayout";

//

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (checkIsSuperUser(session)) {
    const twitchConfig: TwitchConfig = await getTwitchConfig();
    const notificationConfig = await getNotificationsConfig();
    //const twitchEventSubs = await getSubscriptions();
    const channelConfigById = await getChannelConfigById();

    /*
    twitchEventSubs.data.sort((a, b) => {
      const idA = a.condition.broadcaster_user_id;
      const idB = b.condition.broadcaster_user_id;

      if (idA < idB) {
        return -1;
      }
      if (idA > idB) {
        return 1;
      }
      return 0;
    });
    */

    return {
      props: {
        authorized: true,
        superUser: true,
        twitchConfig,
        notificationConfig,
        //twitchEventSubs,
        channelConfigById,
      },
    };
  }

  return {
    notFound: true,
  };
}

const Admin: NextPage<InferGetStaticPropsType<typeof getServerSideProps>> = ({
  twitchConfig,
  notificationConfig,
  //twitchEventSubs,
  channelConfigById,
}) => {
  return (
    <>
      <Head>
        <title>Admin Dashboard | Alveus.gg</title>
      </Head>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <AdminPageLayout title="Dashboard">
        <div className="w-full gap-4 md:flex md:flex-row">
          <div className="flex-1">
            <Giveaways />
          </div>
          <div className="flex-1">
            <Headline>ALPHA Send a notification</Headline>

            <div className="my-4 rounded-lg border bg-white p-4 shadow-xl">
              <SendNotificationForm notificationConfig={notificationConfig} />
            </div>
          </div>
        </div>

        <div className="w-full gap-4 md:flex md:flex-row">
          <div className="flex-1">
            <Headline>Monitored Twitch Channels</Headline>
            <ul>
              {Object.keys(twitchConfig.channels).map((name) => {
                const channelConfig = twitchConfig.channels[name];
                if (!channelConfig) return null;

                return (
                  <li
                    key={name}
                    className="my-4 rounded-lg border bg-white p-4 shadow-xl"
                  >
                    <div className="font-bold">
                      {channelConfig.label} #{channelConfig.id}
                    </div>
                    <div>
                      Notifications:
                      <ul>
                        <li>
                          {channelConfig.notifications.live ? "✓" : "·"} Going
                          Live
                        </li>
                        <li>
                          {channelConfig.notifications.streamCategoryChange
                            ? "✓"
                            : "·"}{" "}
                          Category changed
                        </li>
                        <li>
                          {channelConfig.notifications.streamTitleChange
                            ? "✓"
                            : "·"}{" "}
                          Title changed
                        </li>
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          {/*
          <div className="flex-1">
            <Headline>Active Twitch Event Subscriptions</Headline>
            <ul>
              {twitchEventSubs.data.map((sub) => {
                return (
                  <li
                    key={sub.id}
                    className="my-4 rounded-lg border bg-white p-4 shadow-xl"
                  >
                    <div className="font-bold">
                      {channelConfigById[sub.condition.broadcaster_user_id]
                        ?.label || ""}{" "}
                      #{sub.condition.broadcaster_user_id} {sub.type}
                    </div>
                    <div>{sub.status}</div>
                  </li>
                );
              })}
            </ul>
          </div>
          */}
        </div>
      </AdminPageLayout>
    </>
  );
};
export default Admin;
