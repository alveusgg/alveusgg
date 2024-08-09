import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";
import Meta from "@/components/content/Meta";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { ShortLinks } from "@/components/admin/short-links/ShortLinks";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageShortLinks);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/short-links",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminShortLinksPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Short Links | Admin" />
      <AdminPageLayout title="Short Links" menuItems={menuItems}>
        <ShortLinks />
      </AdminPageLayout>
    </>
  );
};

export default AdminShortLinksPage;
