import React from "react";
import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import Head from "next/head";

import { getAdminSSP } from "@/server/utils/admin";
import { Headline } from "@/components/admin/Headline";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { AdminShowAndTellEntriesPanel } from "@/components/admin/show-and-tell/AdminShowAndTellEntriesPanel";
import { permissions } from "@/config/permissions";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageShowAndTell);
  return adminProps ? { props: adminProps } : { notFound: true };
}

const AdminShowAndTellPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Head>
        <title>Admin Show and Tell | Alveus.gg</title>
      </Head>

      <AdminPageLayout title="Show and Tell" menuItems={menuItems}>
        <Headline>Submission pending approval</Headline>
        <AdminShowAndTellEntriesPanel filter="pendingApproval" />

        <Headline>Approved submissions</Headline>
        <AdminShowAndTellEntriesPanel filter="approved" />
      </AdminPageLayout>
    </>
  );
};

export default AdminShowAndTellPage;
