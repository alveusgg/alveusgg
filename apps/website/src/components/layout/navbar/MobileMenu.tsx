import { DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Fragment } from "react";

import { mainNavStructure } from "@/data/navigation";
import { checkRolesGivePermission, permissions } from "@/data/permissions";

import { useActiveNav } from "@/hooks/active";

import ThemeToggleButton from "@/components/content/ThemeToggleButton";
import { ProfileInfo } from "@/components/layout/navbar/ProfileInfo";

import { NavLinkSub, navLinkClassesSub } from "./NavLink";

export function MobileMenu() {
  const { data: sessionData } = useSession();
  const active = useActiveNav();
  const user = sessionData?.user;
  const showAdminLink =
    user &&
    (user.isSuperUser ||
      checkRolesGivePermission(user.roles, permissions.viewDashboard));

  return (
    <DisclosurePanel>
      <div className="space-y-1 p-2 pb-4 lg:hidden">
        <ul className="flex flex-col">
          {Object.entries(mainNavStructure).map(([key, link]) => (
            <li key={key}>
              {"link" in link ? (
                <DisclosureButton
                  as={NavLinkSub}
                  href={link.link}
                  active={active === link.link}
                  external={link.external}
                  className="w-full"
                >
                  {link.title}
                </DisclosureButton>
              ) : (
                <>
                  <p className="px-5 py-3 opacity-80">{link.title}</p>
                  <ul className="ml-4">
                    {Object.entries(link.dropdown).map(([key, link]) => (
                      <li key={key}>
                        <DisclosureButton
                          as={NavLinkSub}
                          href={link.link}
                          active={active === link.link}
                          external={link.external}
                          className="w-full"
                        >
                          {link.title}
                        </DisclosureButton>
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
          ) : (
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
          )}
          <ThemeToggleButton />
        </ul>
      </div>
    </DisclosurePanel>
  );
}
