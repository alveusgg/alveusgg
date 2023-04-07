import { Disclosure } from "@headlessui/react";
import React, { Fragment } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { navLinkClassesSub, NavLinkSub } from "./NavLink";
import { mainNavStructure } from "@/config/main-nav-structure";
import { checkRolesGivePermission, permissions } from "@/config/permissions";
import { ProfileInfo } from "@/components/layout/navbar/ProfileInfo";

export function MobileMenu() {
  const { data: sessionData } = useSession();

  const user = sessionData?.user;
  const showAdminLink =
    user &&
    (user.isSuperUser ||
      checkRolesGivePermission(user.roles, permissions.viewDashboard));

  return (
    <Disclosure.Panel>
      <div className="space-y-1 p-2 pb-4 lg:hidden">
        <ul className="flex flex-col">
          {Object.entries(mainNavStructure).map(([key, link]) => (
            <li key={key}>
              {"link" in link ? (
                <Disclosure.Button
                  as={NavLinkSub}
                  href={link.link}
                  isExternal={link.isExternal}
                  className="w-full"
                >
                  {link.title}
                </Disclosure.Button>
              ) : (
                <>
                  <p className="px-5 py-3 opacity-80">{link.title}</p>
                  <ul className="ml-4">
                    {Object.entries(link.dropdown).map(([key, link]) => (
                      <li key={key}>
                        <Disclosure.Button
                          as={NavLinkSub}
                          href={link.link}
                          isExternal={link.isExternal}
                          className="w-full"
                        >
                          {link.title}
                        </Disclosure.Button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}

          {/* User menu */}
          {sessionData ? (
            <>
              {showAdminLink && (
                <li>
                  <div className="my-3 w-full border-t opacity-30"></div>

                  <Disclosure.Button
                    as={NavLinkSub}
                    className="px-5 py-3"
                    href="/admin/dashboard"
                  >
                    Admin
                  </Disclosure.Button>
                </li>
              )}
              <li>
                <div className="my-3 w-full border-t opacity-30"></div>

                <div className="px-5 py-3">
                  <ProfileInfo full />
                </div>

                <Disclosure.Button as={Fragment}>
                  <button
                    className={`${navLinkClassesSub} w-full text-left`}
                    type="button"
                    onClick={() => signOut()}
                  >
                    Log Out
                  </button>
                </Disclosure.Button>
              </li>
            </>
          ) : (
            <li>
              <Disclosure.Button as={Fragment}>
                <button
                  className={`${navLinkClassesSub} w-full text-left`}
                  type="button"
                  onClick={() => signIn("twitch")}
                >
                  Sign In
                </button>
              </Disclosure.Button>
            </li>
          )}
        </ul>
      </div>
    </Disclosure.Panel>
  );
}
