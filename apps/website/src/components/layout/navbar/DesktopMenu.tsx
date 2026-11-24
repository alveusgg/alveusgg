import Link from "next/link";

import {
  type NavStructureDropdown,
  getNavLinks,
  isNavDropdown,
  mainNavStructure,
} from "@/data/navigation";

import { useActiveNav } from "@/hooks/active";

import { Dropdown, DropdownMenu } from "./DropdownMenu";
import { NavLink } from "./NavLink";
import { UtilityMenu } from "./UtilityMenu";

export function DesktopMenu() {
  const active = useActiveNav();
  const isActive = (item: NavStructureDropdown) =>
    getNavLinks(item).some((link) => link.link === active);

  return (
    <div className="hidden grow flex-col gap-2 lg:flex">
      <div className="flex justify-end">
        <UtilityMenu mode="desktop" />
      </div>
      <div
        id="main-nav"
        tabIndex={-1}
        className="flex items-center gap-2 border-t border-white pt-2 xl:gap-4"
      >
        <Link href="/" className="font-serif text-3xl font-bold">
          Alveus Sanctuary
        </Link>
        <ul className="flex min-h-12.5 grow items-center justify-end gap-0.5 xl:gap-2">
          {Object.entries(mainNavStructure).map(([key, item]) => (
            <li key={key}>
              {isNavDropdown(item) ? (
                <DropdownMenu
                  title={item.title}
                  href={item.link}
                  color={item.color}
                  active={isActive(item)}
                >
                  <Dropdown dropdown={item} />
                </DropdownMenu>
              ) : (
                <NavLink
                  href={item.link}
                  active={active === item.link}
                  external={item.external}
                >
                  {item.title}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
