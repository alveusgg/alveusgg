import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";

import { permissions } from "@/data/permissions";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { TwitchChannelForm } from "@/components/admin/twitch/TwitchChannelForm";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageTwitchApi);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/twitch/create",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminCreateTwitchChannelPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="New Twitch Channel Config - Twitch API | Admin" />

      <AdminPageLayout
        title="New Twitch Channel Config - Twitch API"
        menuItems={menuItems}
      >
        <Headline>Configure Twitch Channel Config</Headline>

        <Panel>
          <TwitchChannelForm action="create" />
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminCreateTwitchChannelPage;
