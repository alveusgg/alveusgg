import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";

import { permissions } from "@/data/permissions";
import { getAdminSSP } from "@/server/utils/admin";
import { getSession } from "next-auth/react";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Panel } from "@/components/admin/Panel";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.viewDashboard);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id ? "/unauthorized" : "/auth/signin",
        permanent: false,
      },
    };
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
