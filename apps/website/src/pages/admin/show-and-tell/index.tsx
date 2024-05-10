import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { AdminShowAndTellEntriesPanel } from "@/components/admin/show-and-tell/AdminShowAndTellEntriesPanel";
import Meta from "@/components/content/Meta";
import { permissions } from "@/data/permissions";
import { getAdminSSP } from "@/server/utils/admin";
import { getSession } from "next-auth/react";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageShowAndTell);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/show-and-tell",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
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
