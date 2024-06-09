import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { permissions } from "@/data/permissions";

import { getAdminSSP } from "@/server/utils/admin";

import Meta from "@/components/content/Meta";
import { LinkButton } from "@/components/shared/form/Button";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { ChannelConfig } from "@/components/admin/twitch/ChannelConfig";
import { ProvideAuth } from "@/components/admin/twitch/ProvideAuth";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageTwitchApi);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/twitch",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminTwitchPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Twitch API | Admin" />

      <AdminPageLayout title="Twitch API" menuItems={menuItems}>
        <Headline>Configured channels</Headline>
        <Panel>
          <ChannelConfig />

          <LinkButton href="/admin/twitch/create" size="small" width="auto">
            + Add Channel Config
          </LinkButton>
        </Panel>

        <Headline>Provide auth</Headline>
        <Panel>
          <ProvideAuth />
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminTwitchPage;
