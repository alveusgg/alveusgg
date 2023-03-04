import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";

import type { Prisma } from "@prisma/client";
import type { PromiseReturnType } from "@prisma/client/scripts/default-index";

import { getChannelConfigById } from "@/config/twitch";
import { prisma } from "@/server/db/client";

import DefaultPageLayout from "@/components/DefaultPageLayout";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { Headline } from "@/components/shared/Headline";
import { LocalDateTime } from "@/components/shared/LocalDateTime";
import Meta from "@/components/content/Meta";

async function getChannelUpdates() {
  return await prisma.channelUpdateEvent.findMany({
    where: {
      service: "twitch",
      //channel: channelId,
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });
}

type Updates = Prisma.PromiseReturnType<typeof getChannelUpdates>;

export const getStaticProps: GetStaticProps<{
  channelConfigById: PromiseReturnType<typeof getChannelConfigById>;
  updates?: Updates;
}> = async () => {
  const updates = await getChannelUpdates();
  const channelConfigById = await getChannelConfigById();

  return {
    props: { channelConfigById, updates },
    revalidate: 60,
  };
};

const Updates: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  channelConfigById,
  updates,
}) => {
  return (
    <>
      <Meta title="Updates" />

      <DefaultPageLayout title={<span className="flex gap-4">Updates</span>}>
        <Headline>Stay updated! Get notifications.</Headline>
        <NotificationSettings />

        <Headline>Channel updates</Headline>
        <ul>
          {updates?.map((update) => (
            <li
              key={update.id}
              className="text-grey-500 flex flex-row gap-4 border-b border-b-gray-700 p-5"
            >
              <LocalDateTime dateTime={update.createdAt} />
              <span>{channelConfigById[update.channel]?.label}</span>
              <div className="flex flex-col">
                <span className="text-xl">{update.title}</span>
                <span className="text-sm">{update.category_name}</span>
              </div>
            </li>
          ))}
        </ul>
      </DefaultPageLayout>
    </>
  );
};

export default Updates;
