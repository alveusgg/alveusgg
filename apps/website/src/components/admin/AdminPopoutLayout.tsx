import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";

import {
  type PermissionConfig,
  checkRolesGivePermission,
} from "@/data/permissions";

import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { MessageBox } from "@/components/shared/MessageBox";

import ThemeToggleButton from "../content/ThemeToggleButton";

function AdminPopoutLayout({
  title,
  children,
  needsPermission,
}: {
  title?: ReactNode;
  children: ReactNode;
  needsPermission?: PermissionConfig;
}) {
  const session = useSession();
  const user = session.data?.user;

  const hasPermission =
    !needsPermission ||
    (user &&
      (user.isSuperUser ||
        checkRolesGivePermission(user.roles, needsPermission)));

  return (
    <div className="h-full min-h-screen w-full bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex flex-row items-center justify-between p-1">
        <ThemeToggleButton />
        <div className="shrink overflow-hidden text-ellipsis">{title}</div>
        <div className="flex w-fit shrink flex-row items-center gap-2 px-2">
          {session.status === "unauthenticated" ? (
            <LoginWithTwitchButton />
          ) : (
            <button
              type="button"
              onClick={async () => {
                await signOut();
              }}
            >
              Log Out
              {user?.name ? ` (${user.name})` : ""}
            </button>
          )}
        </div>
      </div>

      {session.status === "authenticated" ? (
        hasPermission ? (
          children
        ) : (
          <MessageBox className="m-4">
            <p className="mb-4">
              You do not have permission to view this popout!
            </p>
          </MessageBox>
        )
      ) : (
        <MessageBox className="m-4">
          <p className="mb-4">You need to be logged in with Twitch.</p>

          <LoginWithTwitchButton />
        </MessageBox>
      )}
    </div>
  );
}

export default AdminPopoutLayout;
