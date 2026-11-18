import { Menu, MenuButton } from "@headlessui/react";
import Link from "next/link";

import { mainNavStructure } from "@/data/navigation";

import { classes } from "@/utils/classes";

import { useActiveNav } from "@/hooks/active";

import IconChevronDown from "@/icons/IconChevronDown";

import { Dropdown, DropdownMenuItems } from "./DropdownMenu";
import {
  NavLink,
  navLinkClassesMain,
  navLinkClassesMainActive,
} from "./NavLink";
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
          {Object.entries(mainNavStructure).map(([key, link]) => {
            const primaryLink = "links" in link ? link.primaryLink : undefined;

            return (
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
                  <Menu as="div" className="relative flex">
                    {primaryLink && (
                      <NavLink
                        href={primaryLink}
                        active={active === primaryLink}
                        className="flex h-auto items-center pr-2.5"
                      >
                        {link.title}
                      </NavLink>
                    )}
                    <MenuButton
                      aria-label={
                        primaryLink
                          ? `More ${link.title.toLowerCase()} options`
                          : undefined
                      }
                      className={classes(
                        navLinkClassesMain,
                        (("links" in link &&
                          Object.values(link.links).some(
                            (l) => l.link === active,
                          )) ||
                          ("groups" in link &&
                            Object.values(link.groups).some((group) =>
                              Object.values(group.links).some(
                                (l) => l.link === active,
                              ),
                            ))) &&
                          navLinkClassesMainActive,
                        "group/button flex items-center gap-2",
                        primaryLink && "h-auto px-2.5",
                      )}
                    >
                      {!primaryLink && link.title}
                      {primaryLink && (
                        <span
                          aria-hidden="true"
                          className="h-4 border-l border-white/40"
                        />
                      )}
                      <IconChevronDown
                        size={16}
                        aria-hidden="true"
                        className={classes(
                          "transition-transform",
                          primaryLink
                            ? "group-data-active/button:translate-y-0.5"
                            : "translate-y-0.5 group-data-active/button:translate-y-1",
                        )}
                      />
                    </MenuButton>

                    <DropdownMenuItems>
                      <Dropdown dropdown={link} active={active} />
                    </DropdownMenuItems>
                  </Menu>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
