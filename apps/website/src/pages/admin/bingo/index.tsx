import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { BingoList } from "@/components/admin/bingo/BingoList";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageBingos);
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

const AdminBingosPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Bingos | Admin" />

      <AdminPageLayout title="Bingos" menuItems={menuItems}>
        <BingoList />
      </AdminPageLayout>
    </>
  );
};
export default AdminBingosPage;
