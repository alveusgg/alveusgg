import { Menu, MenuButton } from "@headlessui/react";
import Link from "next/link";

import { mainNavStructure } from "@/data/navigation";

import { classes } from "@/utils/classes";

import { useActiveNav } from "@/hooks/active";

import IconChevronDown from "@/icons/IconChevronDown";

import { Dropdown, DropdownMenuItems } from "./DropdownMenu";
import { NavLink, navLinkClassesMain } from "./NavLink";
import { UtilityMenu } from "./UtilityMenu";

export function DesktopMenu() {
  const active = useActiveNav();

  return (
    <div className="hidden grow flex-col gap-2 lg:flex">
      <div className="flex justify-end">
        <UtilityMenu mode="desktop" />
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
                    <Dropdown dropdown={link} active={active} />
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
