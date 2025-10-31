import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { checkRolesGivePermission, permissions } from "@/data/permissions";

import AdminPopoutLayout from "@/components/admin/AdminPopoutLayout";
import { DonationFeed } from "@/components/admin/donations/DonationFeed";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { MessageBox } from "@/components/shared/MessageBox";

const DonationsPopoutPage: NextPage = () => {
  const session = useSession();
  const user = session.data?.user;

  const canViewDonations =
    user &&
    (user.isSuperUser ||
      checkRolesGivePermission(user.roles, permissions.manageDonations));

  return (
    <AdminPopoutLayout>
      {session.status === "authenticated" ? (
        canViewDonations ? (
          <DonationFeed />
        ) : (
          <MessageBox className="m-4">
            <p className="mb-4">
              You do not have permission to view donations.
            </p>
          </MessageBox>
        )
      ) : (
        <MessageBox className="m-4">
          <p className="mb-4">You need to be logged in with Twitch.</p>

          <LoginWithTwitchButton />
        </MessageBox>
      )}
    </AdminPopoutLayout>
  );
};

export default DonationsPopoutPage;
