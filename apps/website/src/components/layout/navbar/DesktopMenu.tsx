import Link from "next/link";
import { type ComponentType, type ReactNode } from "react";

import {
  type NavStructureDropdown,
  type NavStructureLink,
  donateNavStructure,
  getNavLinks,
  mainNavStructure,
} from "@/data/navigation";

import { useActiveNav } from "@/hooks/active";

import { type IconProps } from "@/icons/BaseIcon";
import IconBuildingLibrary from "@/icons/IconBuildingLibrary";
import IconGift from "@/icons/IconGift";
import IconHeart from "@/icons/IconHeart";
import IconPresentationChartLine from "@/icons/IconPresentationChartLine";

import { Dropdown, DropdownLink, DropdownMenu } from "./DropdownMenu";
import { NavLink } from "./NavLink";
import { UtilityMenu } from "./UtilityMenu";

const DonateLink = ({
  link,
  icon: Icon,
  children,
}: {
  link: NavStructureLink;
  icon: ComponentType<IconProps>;
  children: ReactNode;
}) => (
  <DropdownLink
    link={link}
    color="tan"
    className="group/link flex items-center gap-3 py-2.5"
  >
    <span className="rounded-full bg-alveus-tan-150 p-2 transition-colors group-hover/link:bg-alveus-tan-100 group-data-focus/link:bg-alveus-tan-100">
      <Icon size={20} />
    </span>
    <span className="grow">
      <strong className="block">{link.title}</strong>
      <span className="block text-sm text-alveus-green-700">{children}</span>
    </span>
  </DropdownLink>
);

export function DesktopMenu() {
  const active = useActiveNav();
  const isActive = (item: NavStructureDropdown) =>
    getNavLinks(item).some((link) => link.link === active);
  const donate = donateNavStructure.links;

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
              {"link" in item ? (
                <NavLink
                  href={item.link}
                  active={active === item.link}
                  external={item.external}
                >
                  {item.title}
                </NavLink>
              ) : (
                <DropdownMenu
                  title={item.title}
                  href={"links" in item ? item.primaryLink : undefined}
                  active={isActive(item)}
                >
                  <Dropdown dropdown={item} />
                </DropdownMenu>
              )}
            </li>
          ))}
          <li>
            <DropdownMenu
              title={donateNavStructure.title}
              href={donateNavStructure.primaryLink}
              color="tan"
              active={isActive(donateNavStructure)}
            >
              <DonateLink link={donate.donation} icon={IconHeart}>
                Give once or set up a recurring gift.
              </DonateLink>
              <DonateLink link={donate.wishlist} icon={IconGift}>
                Help buy supplies for the ambassadors.
              </DonateLink>
              <DonateLink link={donate.grants} icon={IconBuildingLibrary}>
                For foundations and corporate grants.
              </DonateLink>
              <DonateLink
                link={donate.givingBlock}
                icon={IconPresentationChartLine}
              >
                Donate via The Giving Block
              </DonateLink>
            </DropdownMenu>
          </li>
        </ul>
      </div>
    </div>
  );
}
