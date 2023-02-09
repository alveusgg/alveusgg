import type { InferGetStaticPropsType } from "next";
import { type NextPage } from "next";
import Head from "next/head";

import DefaultPageLayout from "../components/DefaultPageLayout";

import React from "react";
import { getTwitchConfig } from "../config/twitch";
import { prisma } from "../server/db/client";

export async function getStaticProps() {
  const twitchConfig = await getTwitchConfig();

  const channelData: Array<{
    id: string;
    name: string;
    label: string;
    live: boolean;
    info: {
      title: string;
      categoryId: string;
      categoryName: string;
    } | null;
  }> = [];

  for (const channelName of Object.keys(twitchConfig.channels)) {
    const channelConfig = twitchConfig.channels[channelName];
    if (!channelConfig) continue;

    const liveStatus = await prisma.streamStatusEvent.findFirst({
      where: {
        service: "twitch",
        channel: channelConfig.id,
      },
      orderBy: { createdAt: "desc" },
    });

    const info = await prisma.channelUpdateEvent.findFirst({
      where: {
        service: "twitch",
        channel: channelConfig.id,
      },
      orderBy: { createdAt: "desc" },
    });

    channelData.push({
      id: channelConfig.id,
      name: channelName,
      label: channelConfig.label,
      live: liveStatus?.online || false,
      info: info
        ? {
            title: info.title,
            categoryId: info.category_id,
            categoryName: info.category_name,
          }
        : null,
    });
  }

  return {
    props: {
      channelData,
    },
    revalidate: 60,
  };
}

const AmbassadorsPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ channelData }) => {
  return (
    <>
      <Head>
        <title>Status | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="Streams">
        <section className="flex flex-wrap gap-4">
          {channelData.map(({ id, name, label, live, info }) => {
            return (
              <article
                key={id}
                className="min-w-[200px] flex-1 rounded-lg bg-alveus-green p-3 text-white shadow-xl"
              >
                <a
                  href={`https://twitch.tv/${name}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <h3 className="mb-2 font-serif text-2xl">{label}</h3>
                  {live ? (
                    <div className="flex gap-2">
                      <i
                        className="mt-1 block h-4 w-4 flex-shrink-0 rounded-full bg-red-600"
                        title="Currently Live"
                      />
                      <div className="flex flex-col gap-2">
                        {info?.title || "Live"}{" "}
                        <span className="text-sm text-gray-300">
                          {info?.categoryName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="flex gap-2">
                      <i className="mt-1 block h-4 w-4 flex-shrink-0 rounded-full bg-gray-300" />
                      Not currently live
                    </p>
                  )}
                </a>
              </article>
            );
          })}
        </section>
      </DefaultPageLayout>
    </>
  );
};
export default AmbassadorsPage;
