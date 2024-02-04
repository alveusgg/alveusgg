import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { Headline } from "@/components/admin/Headline";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { permissions } from "@/config/permissions";
import Meta from "@/components/content/Meta";
import { AdminClipsPanel } from "@/components/admin/clips/AdminClipsPanel";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageClips);
  return adminProps ? { props: adminProps } : { notFound: true };
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
