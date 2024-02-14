import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { ShortLinkForm } from "@/components/admin/short-links/ShortLinkForm";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageShortLinks);
  if (!adminProps) {
    return { notFound: true };
  }

  return { props: adminProps };
}

const AdminCreateShortLinkPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Create Short Link | Admin" />

      <AdminPageLayout title="Create Short Link" menuItems={menuItems}>
        <Headline>Create new short link</Headline>

        <Panel>
          <ShortLinkForm action="create" />
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminCreateShortLinkPage;
