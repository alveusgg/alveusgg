import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Children,
  type LiHTMLAttributes,
  type ReactElement,
  type Ref,
  cloneElement,
} from "react";

import { mainNavStructure, utilityNavStructure } from "@/data/navigation";
import { checkRolesGivePermission, permissions } from "@/data/permissions";

import { classes } from "@/utils/classes";

import { useActiveNav } from "@/hooks/active";

import ThemeToggleButton from "@/components/content/ThemeToggleButton";
import {
  NavLink,
  NavLinkSub,
  navLinkClassesMain,
  navLinkClassesSub,
} from "@/components/layout/navbar/NavLink";
import {
  ProfileInfo,
  ProfileInfoImage,
} from "@/components/layout/navbar/ProfileInfo";
import { NotificationsButton } from "@/components/notifications/NotificationsButton";

import IconChevronDown from "@/icons/IconChevronDown";
import IconSignIn from "@/icons/IconSignIn";

const utilityLinkClasses =
  "block rounded-xl bg-transparent p-2 text-white transition-colors hover:bg-white hover:text-alveus-green";

const DropdownMenuItems: typeof MenuItems = ({ ...props }) => (
  <MenuItems
    transition
    className="group/items absolute top-full right-0 z-10 mt-1 flex min-w-40 flex-col gap-0.5 rounded-sm border border-black/20 bg-alveus-green-900 p-2 shadow-lg transition ease-in-out focus:outline-hidden data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75"
    as="ul"
    modal={false}
    {...props}
  />
);
DropdownMenuItems.displayName = "DropdownMenuItems";

const DropdownMenuItem = ({
  children,
  ref,
  ...props
}: LiHTMLAttributes<HTMLLIElement> & {
  children: ReactElement<{ ref?: Ref<HTMLElement> }>;
  ref?: Ref<HTMLElement>;
}) => (
  <li {...props}>
    {/* eslint-disable-next-line react-hooks/refs -- we're passing a ref prop down */}
    {Children.map(children, (child) => cloneElement(child, { ref }))}
  </li>
);

export function DesktopMenu() {
  const { data: sessionData } = useSession();
  const active = useActiveNav();
  const user = sessionData?.user;
  const showAdminLink =
    user &&
    (user.isSuperUser ||
      checkRolesGivePermission(user.roles, permissions.viewDashboard));

  return (
    <div className="hidden grow flex-col gap-2 lg:flex">
      <div className="flex items-center justify-end gap-2">
        <ul className="contents">
          <ThemeToggleButton />
          {Object.entries(utilityNavStructure).map(([key, link]) => (
            <li key={key}>
              {/* eslint-disable-next-line react/jsx-no-target-blank */}
              <a
                className={utilityLinkClasses}
                target="_blank"
                rel={link.rel}
                href={link.link}
                title={link.title}
              >
                <link.icon size={24} />
                <span className="sr-only">Open Alveus&apos; {link.title}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="h-6 border-r"></div>

        <NotificationsButton className={utilityLinkClasses} />

        <div className="h-6 border-r"></div>

        {/* User menu */}
        <div>
          {sessionData ? (
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
                      className={`text-left ${navLinkClassesSub}`}
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
          ) : (
            <button
              className={utilityLinkClasses}
              type="button"
              onClick={() => signIn("twitch")}
              title="Sign in"
            >
              <span className="sr-only">Sign in</span>
              <IconSignIn size={20} className="m-0.5" />
            </button>
          )}
        </div>
      </div>
      <div
        id="main-nav"
        tabIndex={-1}
        className="flex items-center gap-4 border-t border-white pt-2"
      >
        <Link href="/" className="font-serif text-3xl font-bold">
          Alveus Sanctuary
        </Link>
        <ul className="flex grow justify-end">
          {Object.entries(mainNavStructure).map(([key, link]) => (
            <li key={key}>
              {"link" in link ? (
                <NavLink
                  href={link.link}
                  active={active === link.link}
                  external={link.external}
                >
                  {link.title}
                </NavLink>
              ) : (
                <Menu as="div" className="relative">
                  <MenuButton
                    className={classes(
                      navLinkClassesMain,
                      "group/button flex items-center gap-2",
                    )}
                  >
                    {link.title}
                    <IconChevronDown
                      size={16}
                      className="translate-y-0.5 transition-transform group-data-active/button:translate-y-1"
                    />
                  </MenuButton>

                  <DropdownMenuItems>
                    {Object.entries(link.dropdown).map(([key, link]) => (
                      <MenuItem
                        as={DropdownMenuItem}
                        key={key}
                        className="group/item"
                      >
                        {({ close }) => (
                          <NavLinkSub
                            href={link.link}
                            active={active === link.link}
                            external={link.external}
                            className="w-full min-w-max outline-blue-500 group-data-focus/item:not-hover:outline-2"
                            onClick={close}
                          >
                            {link.title}
                          </NavLinkSub>
                        )}
                      </MenuItem>
                    ))}
                  </DropdownMenuItems>
                </Menu>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
