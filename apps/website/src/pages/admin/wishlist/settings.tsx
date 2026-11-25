import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { WishlistChatChannels } from "@/components/admin/wishlist/WishlistChatChannels";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageWishlist);

  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/wishlist/settings",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminWishlistSettingsPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Wishlist Settings | Admin" />
      <AdminPageLayout title="Wishlist Settings" menuItems={menuItems}>
        <WishlistChatChannels />
      </AdminPageLayout>
    </>
  );
};

export default AdminWishlistSettingsPage;
