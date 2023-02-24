import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";
import Head from "next/head";

import { getAdminSSP } from "@/server/utils/admin";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Panel } from "@/components/admin/Panel";
import { permissions } from "@/config/permissions";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.viewDashboard);
  if (!adminProps) {
    return { notFound: true };
  }

  return { props: adminProps };
}

const AdminDashboardPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Head>
        <title>Admin Dashboard | Alveus.gg</title>
      </Head>

      <AdminPageLayout title="Dashboard" menuItems={menuItems}>
        <Panel>TODO: Add something useful here</Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminDashboardPage;
