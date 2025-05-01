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
import { BingoForm } from "@/components/admin/bingo/BingoForm";
import Meta from "@/components/content/Meta";
import { MessageBox } from "@/components/shared/MessageBox";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageBingos);
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

  const id = context.params?.bingoId;
  if (!id) {
    return { notFound: true };
  }

  return {
    props: {
      ...adminProps,
      bingoId: String(id),
    },
  };
}

const AdminEditBingoPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, bingoId }) => {
  const bingo = trpc.adminBingos.getBingo.useQuery(bingoId);

  return (
    <>
      <Meta title="Edit Bingo | Admin" />

      <AdminPageLayout title="Edit Bingo" menuItems={menuItems}>
        <Headline>Edit Bingo</Headline>

        <Panel>
          {bingo.data ? (
            <BingoForm action="edit" bingo={bingo.data} />
          ) : (
            <MessageBox>Loading …</MessageBox>
          )}
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminEditBingoPage;
