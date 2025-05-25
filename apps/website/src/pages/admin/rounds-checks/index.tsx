import type {
  InferGetServerSidePropsType,
  NextPage,
  NextPageContext,
} from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { RoundsChecks } from "@/components/admin/rounds/RoundsChecks";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageRoundsChecks);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/rounds-checks",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminRoundsChecksPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Rounds Checks | Admin" />
      <AdminPageLayout title="Rounds Checks" menuItems={menuItems}>
        <RoundsChecks />
      </AdminPageLayout>
    </>
  );
};

export default AdminRoundsChecksPage;
