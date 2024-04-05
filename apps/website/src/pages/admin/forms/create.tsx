import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getSession } from "next-auth/react";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { FormForm } from "@/components/admin/forms/FormForm";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageForms);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id ? "/unauthorized" : "/auth/signin",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminCreateFormPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Create Form | Admin" />

      <AdminPageLayout title="Create Form" menuItems={menuItems}>
        <Headline>Create new Form</Headline>

        <Panel>
          <FormForm action="create" />
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminCreateFormPage;
