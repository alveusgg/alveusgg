import React from "react";
import type {
  InferGetStaticPropsType,
  NextPage,
  GetServerSidePropsContext,
} from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { GiveawayForm } from "@/components/admin/giveaways/GiveawayForm";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { trpc } from "@/utils/trpc";
import { MessageBox } from "@/components/shared/MessageBox";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const adminProps = await getAdminSSP(context, permissions.manageGiveaways);
  if (!adminProps) {
    return { notFound: true };
  }

  const id = context.params?.giveawayId;
  if (!id) {
    return { notFound: true };
  }

  return {
    props: {
      ...adminProps,
      giveawayId: String(id),
    },
  };
}

const AdminEditGiveawayPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, giveawayId }) => {
  const giveaway = trpc.adminGiveaways.getGiveaway.useQuery(giveawayId);

  return (
    <>
      <Meta title="Edit Giveaway | Admin" />

      <AdminPageLayout title="Edit Giveaway" menuItems={menuItems}>
        <Headline>Create new Giveaway</Headline>

        <Panel>
          {giveaway.data ? (
            <GiveawayForm action="edit" giveaway={giveaway.data} />
          ) : (
            <MessageBox>Loading …</MessageBox>
          )}
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminEditGiveawayPage;
