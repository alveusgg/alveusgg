import { DisclosureButton, DisclosurePanel } from "@headlessui/react";

import { type NavStructureLink, mainNavStructure } from "@/data/navigation";

import { useActiveNav } from "@/hooks/active";

import UserMenuMobile from "@/components/layout/navbar/UserMenuMobile";
import { UtilityMenu } from "@/components/layout/navbar/UtilityMenu";

import { NavLinkSub } from "./NavLink";

function Link({ link, active }: { link: NavStructureLink; active: string }) {
  return (
    <DisclosureButton
      as={NavLinkSub}
      href={link.link}
      active={active === link.link}
      external={link.external}
      className="w-full"
    >
      {link.title}
    </DisclosureButton>
  );
}

export function MobileMenu() {
  const active = useActiveNav();

  return (
    <DisclosurePanel>
      <div className="space-y-1 p-2 pb-4 lg:hidden">
        <div className="flex w-full justify-center pb-2">
          <UtilityMenu mode="mobile" />
        </div>

        <ul className="flex flex-col">
          {Object.entries(mainNavStructure).map(([key, link]) => {
            if ("link" in link) {
              return (
                <li key={key}>
                  <Link link={link} active={active} />
                </li>
              );
            }

            const links =
              "links" in link
                ? Object.entries(link.links)
                : Object.values(link.groups).flatMap((group) =>
                    Object.entries(group.links),
                  );

            return (
              <li key={key}>
                <p className="px-5 py-3 opacity-80">{link.title}</p>
                <ul className="ml-4">
                  {links.map(([key, link]) => (
                    <li key={key}>
                      <Link link={link} active={active} />
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}

          <UserMenuMobile />
        </ul>
      </div>
    </DisclosurePanel>
  );
}
