import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  type MenuItemsProps,
} from "@headlessui/react";
import { type ReactNode, useEffect, useState } from "react";

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

function DropdownLink({
  link,
  color = "green",
}: {
  link: NavStructureLink;
  color?: NavColor;
}) {
  const active = useActiveNav() === link.link;
  const { icon: Icon, description } = link;

  return (
    <MenuItem>
      <NavLinkSub
        href={link.link}
        external={link.external}
        color={color}
        active={active}
        className={Icon && "group/link flex items-center gap-3 py-2.5"}
      >
        {Icon ? (
          <>
            <span
              className={classes(
                "rounded-full p-2 transition-colors",
                navColors[color].icon,
                active && navColors[color].active.icon,
              )}
            >
              <Icon size={20} />
            </span>
            <span className="grow">
              <strong className="block">{link.title}</strong>
              {description && (
                <span
                  className={classes(
                    "block text-sm",
                    navColors[color].description,
                  )}
                >
                  {description}
                </span>
              )}
            </span>
          </>
        ) : (
          link.title
        )}
      </NavLinkSub>
    </MenuItem>
  );
}

const DropdownLinks = ({
  links,
  color,
}: {
  links: Record<string, NavStructureLink>;
  color?: NavColor;
}) => (
  <ul className="flex flex-col gap-0.5">
    {Object.entries(links).map(([key, link]) => (
      <li key={key}>
        <DropdownLink link={link} color={color} />
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
          <DropdownLinks links={group.links} color={dropdown.color} />
        </li>
      ))}
    </ul>
  ) : (
    <DropdownLinks links={dropdown.links} color={dropdown.color} />
  );

export function DropdownMenu({
  title,
  href,
  color,
  active = false,
  children,
}: {
  title: string;
  /** Splits the button, so the title links here and the chevron opens the menu */
  href?: string;
  color?: NavColor;
  active?: boolean;
  children: ReactNode;
}) {
  // Hovering only shows the menu, it is opened (and gets focus) by the button
  const [hovered, setHovered] = useState(false);

  // Escape also dismisses a menu that is only shown by hovering
  useEffect(() => {
    if (!hovered) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHovered(false);
    };

    // Capture, as an open menu stops Escape from propagating when it closes
    window.addEventListener("keydown", handleEscape, true);
    return () => window.removeEventListener("keydown", handleEscape, true);
  }, [hovered]);

  return (
    <Menu
      as="div"
      className="relative flex"
      onPointerEnter={(event) => setHovered(event.pointerType === "mouse")}
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
