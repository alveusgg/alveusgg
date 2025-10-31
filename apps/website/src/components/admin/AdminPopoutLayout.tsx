import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";

import useTheme from "@/hooks/theme";

import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";

import IconMoon from "@/icons/IconMoon";
import IconSun from "@/icons/IconSun";

function AdminPopoutLayout({ children }: { children: ReactNode }) {
  const session = useSession();
  const [theme, toggleTheme] = useTheme();

  return (
    <div className="h-full min-h-screen w-full bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex flex-row justify-between p-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 hover:bg-white hover:text-alveus-green"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <IconMoon /> : <IconSun />}
        </button>
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
              Log Out ({session.data?.user?.name})
            </button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

export default AdminPopoutLayout;
