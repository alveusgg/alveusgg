import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Panel } from "@/components/admin/Panel";
import Meta from "@/components/content/Meta";

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
      <Meta title="Admin" />

      <AdminPageLayout title="Dashboard" menuItems={menuItems}>
        <Panel>TODO: Add something useful here</Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminDashboardPage;
