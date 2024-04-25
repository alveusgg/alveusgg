import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";
import { Headline } from "@/components/admin/Headline";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { AdminClipsPanel } from "@/components/admin/clips/AdminClipsPanel";
import { permissions } from "@/data/permissions";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageClips);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/forms",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminClipsPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Admin Clips" />

      <AdminPageLayout title="Clips" menuItems={menuItems}>
        <Headline>Approved clips</Headline>
        <AdminClipsPanel filter="approved" />

        <Headline>Unapproved clips</Headline>
        <AdminClipsPanel filter="unapproved" />
      </AdminPageLayout>
    </>
  );
};

export default AdminClipsPage;
