import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { ShortLinkForm } from "@/components/admin/short-links/ShortLinkForm";
import Meta from "@/components/content/Meta";
import { permissions } from "@/data/permissions";
import { getAdminSSP } from "@/server/utils/admin";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageShortLinks);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/short-links/create",
        permanent: false,
      },
    };
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
