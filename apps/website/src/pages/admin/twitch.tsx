import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";
import Head from "next/head";
import { getSession, signIn } from "next-auth/react";

import { trpc } from "../../utils/trpc";
import { checkIsSuperUser } from "../../utils/auth";
import { AdminPageLayout } from "../../components/admin/AdminPageLayout";
import Heading from "../../components/content/Heading";
import Section from "../../components/content/Section";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (!checkIsSuperUser(session)) {
    return {
      notFound: true,
    };
  }

  return { props: {} };
}

const Admin: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({}) => {
  const utils = trpc.useContext();
  const channels = trpc.adminTwitch.getChannels.useQuery();
  const connectUserAsBroadcasterOrModerator =
    trpc.adminTwitch.connectUserAsBroadcasterOrModerator.useMutation({
      onSuccess: () => {
        utils.adminTwitch.getChannels.invalidate();
      },
    });

  return (
    <>
      <Head>
        <title>Admin Twitch | Alveus.gg</title>
      </Head>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <AdminPageLayout title="Twitch">
        <Section>
          <Heading>Configured channels</Heading>

          <div className="max-w-[500px] rounded-lg bg-white p-4 shadow-xl">
            {connectUserAsBroadcasterOrModerator.error && (
              <p className="mb-4 rounded-lg border border-red bg-red-200 p-2">
                Connecting User as Channel account failed:{" "}
                {connectUserAsBroadcasterOrModerator.error.message}
              </p>
            )}
            {channels.isLoading && <p>Loading …</p>}
            {channels.isError && (
              <p className="mb-4 rounded-lg border border-red bg-red-200 p-2">
                Error …
              </p>
            )}
            {channels.isSuccess && channels.data?.length ? (
              <ul>
                {channels.data?.map((channel) => (
                  <li key={channel.channelId} className="flex flex-col gap-2">
                    <strong className="block text-lg font-bold">
                      {channel.label} ({channel.username} / {channel.channelId})
                    </strong>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center gap-2 border-t border-gray-700 p-1">
                        <span className="flex-1">
                          {`Broadcaster: ${
                            channel.broadcasterAccount
                              ? `✓ ${channel.broadcasterAccount.id}`
                              : "Not connected"
                          }`}
                        </span>
                        <button
                          type="button"
                          className="rounded-lg border border-gray-300 p-0.5 px-2"
                          onClick={() =>
                            connectUserAsBroadcasterOrModerator.mutate({
                              twitchChannelId: channel.channelId,
                              role: "broadcaster",
                            })
                          }
                        >
                          Connect
                        </button>
                      </div>
                      <div className="flex flex-row items-center gap-2 border-t border-gray-700 p-1">
                        <span className="flex-1">
                          {`Moderator: ${
                            channel.moderatorAccount
                              ? `✓ ${channel.moderatorAccount.id}`
                              : "Not connected"
                          }`}
                        </span>
                        <button
                          type="button"
                          className="rounded-lg border border-gray-300 p-0.5 px-2"
                          onClick={() =>
                            connectUserAsBroadcasterOrModerator.mutate({
                              twitchChannelId: channel.channelId,
                              role: "broadcaster",
                            })
                          }
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No entries.</p>
            )}
          </div>
        </Section>
        <Section>
          <Heading>Provide auth</Heading>
          <button
            type="button"
            className="rounded-lg border border-gray-700 p-1 px-2"
            onClick={() =>
              signIn(
                "twitch",
                { redirect: false },
                {
                  scope:
                    "openid user:read:email user:read:follows user:read:subscriptions channel:read:charity channel:read:subscriptions channel:read:vips moderator:read:followers",
                }
              )
            }
          >
            Auth as broadcaster/moderator
          </button>
        </Section>
      </AdminPageLayout>
    </>
  );
};
export default Admin;
