import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";
import Meta from "@/components/content/Meta";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { ShortLink } from "@/components/admin/short-links/ShortLink";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageShortLinks);
  if (!adminProps) {
    return { notFound: true };
  }

  return { props: adminProps };
}

const AdminShortLinksPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Links | Admin" />
      <AdminPageLayout title="Links" menuItems={menuItems}>
        <ShortLink />
      </AdminPageLayout>
    </>
  );
};

export default AdminShortLinksPage;
