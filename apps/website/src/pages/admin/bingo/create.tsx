import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { BingoForm } from "@/components/admin/bingo/BingoForm";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageBingos);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/bingo/create",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminCreateBingoPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Create Bingo | Admin" />

      <AdminPageLayout title="Create Bingo" menuItems={menuItems}>
        <Headline>Create new Bingo</Headline>

        <Panel>
          <BingoForm action="create" />
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminCreateBingoPage;
