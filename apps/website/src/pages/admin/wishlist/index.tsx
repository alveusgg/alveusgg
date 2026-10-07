import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { WishlistItemsAdmin } from "@/components/admin/wishlist/WishlistItemsAdmin";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageWishlist);

  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/wishlist",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminWishlistPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Wishlist | Admin" />
      <AdminPageLayout title="Wishlist" menuItems={menuItems}>
        <WishlistItemsAdmin />
      </AdminPageLayout>
    </>
  );
};

export default AdminWishlistPage;
