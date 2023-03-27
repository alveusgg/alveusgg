import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { Fragment } from "react";
import { NotificationsButton } from "./NotificationsButton";
import {
  mainNavStructure,
  utilityNavStructure,
} from "@/config/main-nav-structure";
import { checkRolesGivePermission, permissions } from "@/config/permissions";
import {
  NavLink,
  navLinkClassesMain,
  navLinkClassesSub,
  NavLinkSub,
} from "@/components/layout/navbar/NavLink";
import IconAngleDown from "@/icons/IconAngleDown";
import {
  ProfileInfo,
  ProfileInfoImage,
} from "@/components/layout/navbar/ProfileInfo";
import IconSignIn from "@/icons/IconSignIn";

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
      className="absolute top-full right-0 z-30 mt-1 flex min-w-[10rem] flex-col gap-0.5 rounded border border-black/20 bg-alveus-green-900 p-2 shadow-lg"
      {...props}
    />
  </Transition>
);
DropdownMenuItems.displayName = "DropdownMenuItems";

export function DesktopMenu() {
  const { data: sessionData } = useSession();

  const user = sessionData?.user;
  const showAdminLink =
    user &&
    (user.isSuperUser ||
      checkRolesGivePermission(user.roles, permissions.viewDashboard));

  return (
    <div className="hidden flex-grow flex-col gap-2 lg:flex">
      <div className="flex items-center gap-4">
        <ul className="flex flex-grow items-center justify-end gap-4">
          {Object.entries(utilityNavStructure).map(([key, link]) => (
            <li key={key}>
              <a
                className="block rounded-xl bg-transparent p-2 text-white transition-colors hover:bg-white hover:text-alveus-green"
                href={link.link}
                target="_blank"
                rel="noreferrer"
                aria-label={link.title}
              >
                <link.icon size={24} />
              </a>
            </li>
          ))}

          {/* Notifications toggle */}
          <li className="flex gap-4">
            <div className="border-l border-white"></div>

            <NotificationsButton />
          </li>

          {/* User menu */}
          <li>
            {sessionData ? (
              <Menu as="div" className="relative flex h-full items-center">
                <Menu.Button
                  as="button"
                  className="mx-1 cursor-pointer select-none appearance-none rounded-full border-2 border-transparent transition-colors hover:border-white aria-expanded:border-white"
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
                className={navLinkClassesMain}
                type="button"
                onClick={() => signIn("twitch")}
                title="Sign in"
              >
                <span className="sr-only">Sign in</span>
                <IconSignIn size={20} className="mx-1" />
              </button>
            )}
          </li>
        </ul>
      </div>
      <div className="flex items-center gap-4 border-t border-white pt-2">
        <Link href="/" className="font-serif text-3xl font-bold">
          Alveus
        </Link>
        <ul className="flex flex-grow justify-end">
          {Object.entries(mainNavStructure).map(([key, link]) => (
            <li key={key}>
              {"link" in link ? (
                <NavLink href={link.link}>{link.title}</NavLink>
              ) : (
                <Menu as="div" className="relative">
                  {({ open }) => (
                    <>
                      <Menu.Button
                        className={[
                          navLinkClassesMain,
                          "flex items-center gap-2",
                        ]
                          .filter(Boolean)
                          .join(" ")}
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
                          <Menu.Item as="li" key={key}>
                            {({ close }) => (
                              <NavLinkSub
                                href={link.link}
                                className="w-full min-w-max"
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
