import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { GiveawayForm } from "@/components/admin/giveaways/GiveawayForm";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageGiveaways);
  if (!adminProps) {
    return { notFound: true };
  }

  return { props: adminProps };
}

const AdminGiveawaysPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Create Giveaway | Admin" />

      <AdminPageLayout title="Create Giveaway" menuItems={menuItems}>
        <Headline>Create new Giveaway</Headline>

        <Panel>
          <GiveawayForm action="create" />
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminGiveawaysPage;
