import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Forms } from "@/components/admin/forms/Forms";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageForms);
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
