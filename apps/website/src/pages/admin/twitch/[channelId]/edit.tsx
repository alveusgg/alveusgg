import type {
  InferGetStaticPropsType,
  NextPage,
  GetServerSidePropsContext,
} from "next";

import { getSession } from "next-auth/react";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { trpc } from "@/utils/trpc";
import { MessageBox } from "@/components/shared/MessageBox";
import { TwitchChannelForm } from "@/components/admin/twitch/TwitchChannelForm";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageTwitchApi);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : `/auth/signin?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  const id = context.params?.channelId;
  if (!id) {
    return { notFound: true };
  }

  return {
    props: {
      ...adminProps,
      channelId: String(id),
    },
  };
}

const AdminEditTwitchChannelPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, channelId }) => {
  const channel = trpc.adminTwitch.getChannel.useQuery(channelId);

  return (
    <>
      <Meta title="Edit Twitch Channel Config - Twitch API | Admin" />

      <AdminPageLayout
        title="Edit Twitch Channel Config - Twitch API"
        menuItems={menuItems}
      >
        <Headline>Edit Twitch Channel Config</Headline>

        <Panel>
          {channel.data ? (
            <TwitchChannelForm action="edit" data={channel.data} />
          ) : (
            <MessageBox>Loading …</MessageBox>
          )}
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminEditTwitchChannelPage;
