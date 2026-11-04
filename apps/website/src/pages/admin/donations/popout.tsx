import { type NextPage } from "next";

import { permissions } from "@/data/permissions";

import AdminPopoutLayout from "@/components/admin/AdminPopoutLayout";
import { DonationFeed } from "@/components/admin/donations/DonationFeed";
import Meta from "@/components/content/Meta";

const DonationsPopoutPage: NextPage = () => {
  return (
    <>
      <Meta title="Donations Popout | Admin" />

      <AdminPopoutLayout
        title="Donations"
        needsPermission={permissions.manageDonations}
      >
        <DonationFeed />
      </AdminPopoutLayout>
    </>
  );
};

export default DonationsPopoutPage;
