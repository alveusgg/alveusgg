import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";
import type { z } from "zod";

import type { TwitchConfig } from "@/config/twitch";
import { getChannelConfigById, getTwitchConfig } from "@/config/twitch";
import type { subscriptionSchema } from "@/server/utils/twitch-api";
import { getSubscriptions } from "@/server/utils/twitch-api";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { Headline } from "@/components/admin/Headline";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Panel } from "@/components/admin/Panel";
import Meta from "@/components/content/Meta";

type Subscription = z.infer<typeof subscriptionSchema>;

function sortSubscriptionByBroadcasterId(a: Subscription, b: Subscription) {
  const idA = a.condition.broadcaster_user_id;
  const idB = b.condition.broadcaster_user_id;

  if (idA < idB) {
    return -1;
  }
  if (idA > idB) {
    return 1;
  }
  return 0;
}

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageTwitchApi);
  if (!adminProps) {
    return { notFound: true };
  }

  const twitchConfig: TwitchConfig = await getTwitchConfig();
  const twitchEventSubs = await getSubscriptions();
  const channelConfigById = await getChannelConfigById();
  twitchEventSubs.data.sort(sortSubscriptionByBroadcasterId);

  return {
    props: {
      ...adminProps,
      twitchConfig,
      twitchEventSubs,
      channelConfigById,
    },
  };
}

const AdminTwitchPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, twitchConfig, twitchEventSubs, channelConfigById }) => {
  return (
    <>
      <Meta title="Twitch | Admin" />

      <AdminPageLayout title="Dashboard" menuItems={menuItems}>
        <Headline>Active Twitch Event Subscriptions</Headline>

        <ul className="text-black">
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

        <Headline>Monitored Twitch Channels</Headline>
        <ul className="text-black">
          {Object.keys(twitchConfig.channels).map((name) => {
            const channelConfig = twitchConfig.channels[name];
            if (!channelConfig) return null;

            return (
              <li key={name}>
                <Panel>
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
                </Panel>
              </li>
            );
          })}
        </ul>
      </AdminPageLayout>
    </>
  );
};
export default AdminTwitchPage;
