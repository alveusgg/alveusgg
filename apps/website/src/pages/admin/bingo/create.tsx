import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { BingoForm } from "@/components/admin/bingo/BingoForm";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageBingos);
  if (!adminProps) {
    return { notFound: true };
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
