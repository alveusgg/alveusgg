import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";
import Head from "next/head";

import { getAdminSSP } from "@/server/utils/admin";
import { Giveaways } from "@/components/admin/Giveaways";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { permissions } from "@/config/permissions";

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
      <Head>
        <title>Admin Giveaways | Alveus.gg</title>
      </Head>

      <AdminPageLayout title="Giveaways" menuItems={menuItems}>
        <Giveaways />
      </AdminPageLayout>
    </>
  );
};
export default AdminGiveawaysPage;
