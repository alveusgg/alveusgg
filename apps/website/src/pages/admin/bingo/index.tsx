import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { BingoList } from "@/components/admin/bingo/BingoList";
import Meta from "@/components/content/Meta";
import { permissions } from "@/data/permissions";
import { getAdminSSP } from "@/server/utils/admin";

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
