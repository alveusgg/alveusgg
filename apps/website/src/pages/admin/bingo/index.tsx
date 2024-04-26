import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getSession } from "next-auth/react";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { BingoList } from "@/components/admin/bingo/BingoList";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageBingos);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/bingo",
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
