import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { Forms } from "@/components/admin/forms/Forms";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageForms);
  if (!adminProps || !adminProps.isSuperUser) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminFormsPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Forms | Admin" />

      <AdminPageLayout title="Forms" menuItems={menuItems}>
        <Forms />
      </AdminPageLayout>
    </>
  );
};
export default AdminFormsPage;
