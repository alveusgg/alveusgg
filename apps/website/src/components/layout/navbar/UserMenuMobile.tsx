import { DisclosureButton } from "@headlessui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Fragment } from "react";

import { checkRolesGivePermission, permissions } from "@/data/permissions";

import {
  NavLinkSub,
  navLinkClassesSub,
} from "@/components/layout/navbar/NavLink";
import { ProfileInfo } from "@/components/layout/navbar/ProfileInfo";

const UserMenuMobile = () => {
  const { data: sessionData } = useSession();

  const user = sessionData?.user;
  const showAdminLink =
    user &&
    (user.isSuperUser ||
      checkRolesGivePermission(user.roles, permissions.viewDashboard));

  if (!sessionData) {
    return (
      <li>
        <DisclosureButton as={Fragment}>
          <button
            className={`${navLinkClassesSub} w-full text-left`}
            type="button"
            onClick={() => signIn("twitch")}
          >
            Sign In
          </button>
        </DisclosureButton>
      </li>
    );
  }

  return (
    <>
      {showAdminLink && (
        <li>
          <div className="my-3 w-full border-t opacity-30"></div>

          <DisclosureButton as={NavLinkSub} href="/admin/dashboard">
            Admin
          </DisclosureButton>
        </li>
      )}

      <li>
        <div className="my-3 w-full border-t opacity-30"></div>

        <div className="px-5 py-2">
          <ProfileInfo full />
        </div>

        <DisclosureButton as={Fragment}>
          <button
            className={`${navLinkClassesSub} w-full text-left`}
            type="button"
            onClick={() => signOut()}
          >
            Log Out
          </button>
        </DisclosureButton>
      </li>
    </>
  );
};

export default UserMenuMobile;
