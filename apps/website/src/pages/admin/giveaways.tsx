import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { Giveaways } from "@/components/admin/Giveaways";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";

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
      <Meta title="Giveaways | Admin" />

      <AdminPageLayout title="Giveaways" menuItems={menuItems}>
        <Giveaways />
      </AdminPageLayout>
    </>
  );
};
export default AdminGiveawaysPage;
