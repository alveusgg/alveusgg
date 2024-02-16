import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { Headline } from "@/components/admin/Headline";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { AdminShowAndTellEntriesPanel } from "@/components/admin/show-and-tell/AdminShowAndTellEntriesPanel";
import { permissions } from "@/data/permissions";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageShowAndTell);
  return adminProps ? { props: adminProps } : { notFound: true };
}

const AdminShowAndTellPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Admin Show and Tell" />

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
