import type {
  InferGetStaticPropsType,
  NextPage,
  GetServerSidePropsContext,
} from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { BingoForm } from "@/components/admin/bingo/BingoForm";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { trpc } from "@/utils/trpc";
import { MessageBox } from "@/components/shared/MessageBox";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const adminProps = await getAdminSSP(context, permissions.manageBingos);
  if (!adminProps || !adminProps.isSuperUser) {
    return {
      redirect: {
        destination: "/auth/signin",
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
