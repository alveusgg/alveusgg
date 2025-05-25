import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { RoundsCheckForm } from "@/components/admin/rounds/RoundsCheckForm";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageRoundsChecks);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/rounds-checks/create",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminCreateRoundsCheckPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Create Rounds Check | Admin" />

      <AdminPageLayout title="Create Rounds Check" menuItems={menuItems}>
        <Headline>Create new rounds check</Headline>

        <Panel>
          <RoundsCheckForm action="create" />
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminCreateRoundsCheckPage;
