import { Menu, MenuButton, MenuItem } from "@headlessui/react";
import { signIn, signOut, useSession } from "next-auth/react";

import { checkRolesGivePermission, permissions } from "@/data/permissions";

import { classes } from "@/utils/classes";

import { DropdownMenuItems } from "@/components/layout/navbar/DropdownMenu";
import {
  NavLinkSub,
  navLinkClassesSub,
} from "@/components/layout/navbar/NavLink";
import {
  ProfileInfo,
  ProfileInfoImage,
} from "@/components/layout/navbar/ProfileInfo";
import { utilityLinkClasses } from "@/components/layout/navbar/UtilityMenu";

import IconSignIn from "@/icons/IconSignIn";

const UserMenuDesktop = () => {
  const { data: sessionData } = useSession();

  const user = sessionData?.user;
  const showAdminLink =
    user &&
    (user.isSuperUser ||
      checkRolesGivePermission(user.roles, permissions.viewDashboard));

  if (!sessionData) {
    return (
      <div>
        <button
          className={utilityLinkClasses}
          type="button"
          onClick={() => signIn("twitch")}
          title="Sign in"
        >
          <span className="sr-only">Sign in</span>
          <IconSignIn size={20} className="m-0.5" />
        </button>
      </div>
    );
  }

  return (
    <Menu as="div" className="relative flex h-full items-center">
      <MenuButton
        as="button"
        className="mx-3 cursor-pointer appearance-none rounded-full select-none"
      >
        <span className="sr-only">Open user menu</span>
        <ProfileInfoImage />
      </MenuButton>

      <DropdownMenuItems>
        <MenuItem disabled>
          <div className="px-5 py-2">
            <ProfileInfo full />
          </div>
        </MenuItem>

        <MenuItem disabled>
          <div className="border-t opacity-30"></div>
        </MenuItem>

        {showAdminLink && (
          <MenuItem>
            <NavLinkSub href="/admin/dashboard">Admin</NavLinkSub>
          </MenuItem>
        )}

        <MenuItem disabled>
          <div className="border-t opacity-30"></div>
        </MenuItem>

        <MenuItem>
          {({ close }) => (
            <button
              className={classes("text-left", navLinkClassesSub)}
              type="button"
              onClick={async () => {
                close();
                await signOut();
              }}
            >
              Log Out
            </button>
          )}
        </MenuItem>
      </DropdownMenuItems>
    </Menu>
  );
};

export default UserMenuDesktop;
