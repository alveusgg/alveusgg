import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { permissions } from "@/data/permissions";

import { getAdminSSP } from "@/server/utils/admin";

import { LinkButton } from "@/components/shared/form/Button";
import Meta from "@/components/content/Meta";

import { Headline } from "@/components/admin/Headline";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Panel } from "@/components/admin/Panel";
import { ProvideAuth } from "@/components/admin/twitch/ProvideAuth";
import { ChannelConfig } from "@/components/admin/twitch/ChannelConfig";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageTwitchApi);
  return adminProps ? { props: adminProps } : { notFound: true };
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
