import { type NextPage } from "next";

import { permissions } from "@/data/permissions";

import AdminPopoutLayout from "@/components/admin/AdminPopoutLayout";
import { DonationFeed } from "@/components/admin/donations/DonationFeed";

const DonationsPopoutPage: NextPage = () => {
  return (
    <AdminPopoutLayout
      title="Donations"
      needsPermission={permissions.manageDonations}
    >
      <DonationFeed />
    </AdminPopoutLayout>
  );
};

export default DonationsPopoutPage;
