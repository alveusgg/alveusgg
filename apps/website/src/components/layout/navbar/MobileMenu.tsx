import { DisclosureButton, DisclosurePanel } from "@headlessui/react";

import {
  type NavStructure,
  type NavStructureDropdown,
  type NavStructureLink,
  donateNavStructure,
  mainNavStructure,
} from "@/data/navigation";

import { useActiveNav } from "@/hooks/active";

import UserMenuMobile from "@/components/layout/navbar/UserMenuMobile";
import { UtilityMenu } from "@/components/layout/navbar/UtilityMenu";

import IconChevronDown from "@/icons/IconChevronDown";

import { NavLinkSub } from "./NavLink";

const navStructure: NavStructure = {
  ...mainNavStructure,
  donate: donateNavStructure,
};

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

const MobileMenuSubSection = ({
  data,
  active,
}: {
  data: NavStructureDropdown;
  active: string;
}) => {
  if ("groups" in data) {
    return (
      <ul className="ml-3 border-l border-white/30 pl-0.5">
        {Object.entries(data.groups).map(([key, group]) => (
          <li key={key}>
            <p className="mt-3 px-3 text-sm opacity-80">{group.title}</p>
            <ul className="ml-2">
              {Object.entries(group.links).map(([key, link]) => (
                <li key={key}>
                  <Link link={link} active={active} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="ml-3 border-l border-white/30 pl-0.5">
      {Object.entries(data.links).map(([key, link]) => (
        <li key={key}>
          <Link link={link} active={active} />
        </li>
      ))}
    </ul>
  );
};

export function MobileMenu() {
  const active = useActiveNav();

  return (
    <DisclosurePanel>
      <div className="space-y-1 p-2 pb-4 lg:hidden">
        <div className="flex w-full justify-center pb-2">
          <UtilityMenu mode="mobile" />
        </div>

        <ul className="flex flex-col">
          {Object.entries(navStructure).map(([key, link]) => {
            if ("link" in link) {
              return (
                <li key={key}>
                  <Link link={link} active={active} />
                </li>
              );
            }

            if ("links" in link && link.primaryLink) {
              return (
                <li key={key} className="relative">
                  <div className="mr-12">
                    <Link
                      link={{ title: link.title, link: link.primaryLink }}
                      active={active}
                    />
                  </div>
                  <details className="group">
                    <summary className="absolute top-0 right-0 flex h-10 w-12 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-alveus-green-800 [&::-webkit-details-marker]:hidden">
                      <span className="sr-only">
                        More {link.title.toLowerCase()} options
                      </span>
                      <IconChevronDown
                        size={16}
                        aria-hidden="true"
                        className="transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <MobileMenuSubSection data={link} active={active} />
                  </details>
                </li>
              );
            }

            return (
              <li key={key}>
                <p className="px-3 pt-4 pb-1 opacity-80">{link.title}</p>
                <MobileMenuSubSection data={link} active={active} />
              </li>
            );
          })}

          <UserMenuMobile />
        </ul>
      </div>
    </DisclosurePanel>
  );
}
