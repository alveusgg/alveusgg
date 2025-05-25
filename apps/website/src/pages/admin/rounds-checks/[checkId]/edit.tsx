import type {
  GetServerSidePropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";

import { trpc } from "@/utils/trpc";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { RoundsCheckForm } from "@/components/admin/rounds/RoundsCheckForm";
import Meta from "@/components/content/Meta";
import { MessageBox } from "@/components/shared/MessageBox";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageRoundsChecks);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : `/auth/signin?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  const id = context.params?.checkId;
  if (!id) {
    return { notFound: true };
  }

  return {
    props: {
      ...adminProps,
      checkId: String(id),
    },
  };
}

const AdminEditRoundsCheckPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, checkId }) => {
  const check = trpc.adminRoundsChecks.getRoundsCheck.useQuery(checkId);

  return (
    <>
      <Meta title="Edit Rounds Check | Admin" />

      <AdminPageLayout title="Edit Rounds Check" menuItems={menuItems}>
        <Headline>Edit Rounds Check</Headline>

        <Panel>
          {check.data ? (
            <RoundsCheckForm action="edit" check={check.data} />
          ) : (
            <MessageBox>Loading …</MessageBox>
          )}
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminEditRoundsCheckPage;
