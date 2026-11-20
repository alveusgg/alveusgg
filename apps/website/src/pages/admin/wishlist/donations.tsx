import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { WishlistDonationsAdmin } from "@/components/admin/wishlist/WishlistDonationsAdmin";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageWishlist);

  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/wishlist/donations",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminWishlistDonationsPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Wishlist Donations | Admin" />
      <AdminPageLayout title="Wishlist Donations" menuItems={menuItems}>
        <WishlistDonationsAdmin />
      </AdminPageLayout>
    </>
  );
};

export default AdminWishlistDonationsPage;
