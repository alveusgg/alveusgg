import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { Children, cloneElement, forwardRef, Fragment } from "react";

import {
  mainNavStructure,
  utilityNavStructure,
} from "@/config/main-nav-structure";
import { checkRolesGivePermission, permissions } from "@/config/permissions";

import { classes } from "@/utils/classes";

import {
  NavLink,
  navLinkClassesMain,
  navLinkClassesSub,
  NavLinkSub,
} from "@/components/layout/navbar/NavLink";
import {
  ProfileInfo,
  ProfileInfoImage,
} from "@/components/layout/navbar/ProfileInfo";
import { NotificationsButton } from "@/components/layout/navbar/NotificationsButton";

import IconSignIn from "@/icons/IconSignIn";
import IconAngleDown from "@/icons/IconAngleDown";

const DropdownMenuItems: typeof Menu.Items = ({ ...props }) => (
  <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    <Menu.Items
      as="ul"
      className="group absolute right-0 top-full z-30 mt-1 flex min-w-[10rem] flex-col gap-0.5 rounded border border-black/20 bg-alveus-green-900 p-2 shadow-lg focus:outline-none"
      {...props}
    />
  </Transition>
);
DropdownMenuItems.displayName = "DropdownMenuItems";

const DropdownMenuItem: React.FC<{ children: React.ReactElement }> = forwardRef(
  ({ children, ...props }, ref) => (
    <li {...props}>
      {Children.map(children, (child) => cloneElement(child, { ref }))}
    </li>
  )
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export function DesktopMenu() {
  const { data: sessionData } = useSession();

  const user = sessionData?.user;
  const showAdminLink =
    user &&
    (user.isSuperUser ||
      checkRolesGivePermission(user.roles, permissions.viewDashboard));

  return (
    <div className="hidden flex-grow flex-col gap-2 lg:flex">
      <div className="flex items-center justify-end gap-2">
        <ul className="contents">
          {Object.entries(utilityNavStructure).map(([key, link]) => (
            <li key={key}>
              <a
                className="block rounded-xl bg-transparent p-2 text-white transition-colors hover:bg-white hover:text-alveus-green"
                target="_blank"
                rel="noreferrer"
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

        {/* Notifications toggle */}
        <NotificationsButton />

        <div className="h-6 border-r"></div>

        {/* User menu */}
        <div>
          {sessionData ? (
            <Menu as="div" className="relative flex h-full items-center">
              <Menu.Button
                as="button"
                className="mx-3 cursor-pointer select-none appearance-none rounded-full"
              >
                <span className="sr-only">Open user menu</span>
                <ProfileInfoImage />
              </Menu.Button>

              <DropdownMenuItems>
                <Menu.Item disabled>
                  <div className="px-5 py-3">
                    <ProfileInfo full />
                  </div>
                </Menu.Item>

                <Menu.Item disabled>
                  <div className="border-t opacity-30"></div>
                </Menu.Item>

                {showAdminLink && (
                  <Menu.Item>
                    <NavLinkSub className="px-5 py-3" href="/admin/dashboard">
                      Admin
                    </NavLinkSub>
                  </Menu.Item>
                )}

                <Menu.Item disabled>
                  <div className="border-t opacity-30"></div>
                </Menu.Item>

                <Menu.Item>
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
                </Menu.Item>
              </DropdownMenuItems>
            </Menu>
          ) : (
            <button
              className={navLinkClassesSub}
              type="button"
              onClick={() => signIn("twitch")}
              title="Sign in"
            >
              <span className="sr-only">Sign in</span>
              <IconSignIn size={20} />
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
          Alveus
        </Link>
        <ul className="flex flex-grow justify-end">
          {Object.entries(mainNavStructure).map(([key, link]) => (
            <li key={key}>
              {"link" in link ? (
                <NavLink href={link.link} isExternal={link.isExternal}>
                  {link.title}
                </NavLink>
              ) : (
                <Menu as="div" className="relative">
                  {({ open }) => (
                    <>
                      <Menu.Button
                        className={classes(
                          navLinkClassesMain,
                          "flex items-center gap-2"
                        )}
                      >
                        {link.title}
                        <IconAngleDown
                          size={16}
                          className={`${
                            open ? "translate-y-1" : "translate-y-0.5"
                          } transition-transform`}
                        />
                      </Menu.Button>

                      <DropdownMenuItems>
                        {Object.entries(link.dropdown).map(([key, link]) => (
                          <Menu.Item as={DropdownMenuItem} key={key}>
                            {({ close, active }) => (
                              <NavLinkSub
                                href={link.link}
                                className={classes(
                                  active &&
                                    "outline-blue-500 group-focus-visible:outline",
                                  "w-full min-w-max"
                                )}
                                onClick={close}
                              >
                                {link.title}
                              </NavLinkSub>
                            )}
                          </Menu.Item>
                        ))}
                      </DropdownMenuItems>
                    </>
                  )}
                </Menu>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
