import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  type MenuItemsProps,
} from "@headlessui/react";
import { type ReactNode, useState } from "react";

import {
  type NavStructureDropdown,
  type NavStructureLink,
} from "@/data/navigation";

import { classes } from "@/utils/classes";

import { useActiveNav } from "@/hooks/active";

import IconChevronDown from "@/icons/IconChevronDown";

import { NavLink, NavLinkSub, navLinkClasses } from "./NavLink";
import { type NavColor, navColors } from "./colors";

export const DropdownMenuItems = ({
  color = "green",
  ...props
}: Pick<MenuItemsProps<"div">, "static" | "onClick"> & {
  color?: NavColor;
  children: ReactNode;
}) => (
  <MenuItems
    as="div"
    modal={false}
    className={classes(
      "absolute top-full right-0 z-10 mt-1 flex w-max min-w-40 flex-col gap-0.5 rounded-2xl border p-2 shadow-lg transition duration-100 ease-out focus:outline-hidden starting:scale-95 starting:opacity-0",
      // Cover the gap above the panel, so the pointer can reach a menu opened on hover
      "before:absolute before:inset-x-0 before:bottom-full before:h-2",
      navColors[color].panel,
    )}
    {...props}
  />
);

export function DropdownLink({
  link,
  color,
  className,
  children = link.title,
}: {
  link: NavStructureLink;
  color?: NavColor;
  className?: string;
  children?: ReactNode;
}) {
  const active = useActiveNav() === link.link;

  return (
    <MenuItem>
      <NavLinkSub
        href={link.link}
        external={link.external}
        color={color}
        active={active}
        className={className}
      >
        {children}
      </NavLinkSub>
    </MenuItem>
  );
}

const DropdownLinks = ({
  links,
}: {
  links: Record<string, NavStructureLink>;
}) => (
  <ul className="flex flex-col gap-0.5">
    {Object.entries(links).map(([key, link]) => (
      <li key={key}>
        <DropdownLink link={link} />
      </li>
    ))}
  </ul>
);

export const Dropdown = ({ dropdown }: { dropdown: NavStructureDropdown }) =>
  "groups" in dropdown ? (
    <ul className="flex flex-col gap-3">
      {Object.entries(dropdown.groups).map(([key, group]) => (
        <li key={key}>
          <p className="mx-3 mb-1 border-b border-alveus-green-700 pt-1 text-sm text-alveus-green-200">
            {group.title}
          </p>
          <DropdownLinks links={group.links} />
        </li>
      ))}
    </ul>
  ) : (
    <DropdownLinks links={dropdown.links} />
  );

export function DropdownMenu({
  title,
  href,
  color,
  active = false,
  openOnHover = false,
  children,
}: {
  title: string;
  /** Splits the button, so the title links here and the chevron opens the menu */
  href?: string;
  color?: NavColor;
  active?: boolean;
  openOnHover?: boolean;
  children: ReactNode;
}) {
  // Hovering only shows the menu, it is opened (and gets focus) by the button
  const [hovered, setHovered] = useState(false);

  return (
    <Menu
      as="div"
      className="relative flex"
      onPointerEnter={(event) =>
        setHovered(openOnHover && event.pointerType === "mouse")
      }
      onPointerLeave={() => setHovered(false)}
    >
      {({ open }) => (
        <>
          {href && (
            <NavLink
              href={href}
              color={color}
              active={active}
              className="rounded-r-none pr-3"
            >
              {title}
            </NavLink>
          )}

          <MenuButton
            aria-label={
              href ? `More ${title.toLowerCase()} options` : undefined
            }
            className={classes(
              navLinkClasses({ color, active: open || active }),
              "group/button gap-2",
              href && "-ml-px rounded-l-none pr-3 pl-2",
            )}
          >
            {!href && title}
            <IconChevronDown
              size={16}
              className="translate-y-0.5 transition-transform group-data-active/button:translate-y-1"
            />
          </MenuButton>

          <DropdownMenuItems
            color={color}
            static={hovered}
            onClick={() => setHovered(false)}
          >
            {children}
          </DropdownMenuItems>
        </>
      )}
    </Menu>
  );
}
