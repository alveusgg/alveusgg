import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";
import Meta from "@/components/content/Meta";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { ShortLinks } from "@/components/admin/short-links/ShortLinks";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageShortLinks);
  if (!adminProps) {
    return {
      redirect: {
        destination: "/auth/signin",
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
