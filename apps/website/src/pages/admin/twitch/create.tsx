import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getSession } from "next-auth/react";
import { permissions } from "@/data/permissions";

import { getAdminSSP } from "@/server/utils/admin";

import { Headline } from "@/components/admin/Headline";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { Panel } from "@/components/admin/Panel";
import { TwitchChannelForm } from "@/components/admin/twitch/TwitchChannelForm";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageTwitchApi);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id ? "/admin/unauthorized" : "/auth/signin",
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
