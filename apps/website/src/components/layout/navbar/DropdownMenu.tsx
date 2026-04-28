import { MenuItem, MenuItems } from "@headlessui/react";
import {
  Children,
  type LiHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  cloneElement,
} from "react";

import {
  type NavStructureDropdown,
  type NavStructureLink,
} from "@/data/navigation";

import { NavLinkSub } from "@/components/layout/navbar/NavLink";

const DropdownMenuItem = ({
  children,
  ref,
  ...props
}: LiHTMLAttributes<HTMLLIElement> & {
  children: ReactElement<{ ref?: Ref<HTMLElement> }>;
  ref?: Ref<HTMLElement>;
}) => (
  <li {...props}>
    {/* eslint-disable-next-line react-hooks/refs -- we're passing a ref prop down */}
    {Children.map(children, (child) => cloneElement(child, { ref }))}
  </li>
);

function DropdownLinks({
  links,
  active,
}: {
  links: Record<string, NavStructureLink>;
  active: string;
}) {
  return (
    <>
      {Object.entries(links).map(([key, link]) => (
        <MenuItem as={DropdownMenuItem} key={key} className="group/item">
          {({ close }) => (
            <NavLinkSub
              href={link.link}
              active={active === link.link}
              external={link.external}
              className="w-full min-w-max outline-blue-500 group-data-focus/item:not-hover:outline-2"
              onClick={close}
            >
              {link.title}
            </NavLinkSub>
          )}
        </MenuItem>
      ))}
    </>
  );
}

export const Dropdown = ({
  dropdown,
  active,
}: {
  dropdown: NavStructureDropdown;
  active: string;
}) => {
  if ("groups" in dropdown) {
    return (
      <div className="flex flex-col gap-3">
        {Object.entries(dropdown.groups).map(([key, group]) => (
          <div key={key}>
            <h3 className="mx-2 mb-1 block border-b border-alveus-green-600 pt-1 text-sm text-alveus-green-400">
              {group.title}
            </h3>
            <div className="flex flex-col gap-0.5">
              <DropdownLinks links={group.links} active={active} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <DropdownLinks links={dropdown.links} active={active} />;
};

export const DropdownMenuItems = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => (
  <MenuItems
    transition
    className="group/items absolute top-full right-0 z-10 mt-1 flex min-w-40 flex-col gap-0.5 rounded-sm border border-black/20 bg-alveus-green-900 p-2 shadow-lg transition ease-in-out focus:outline-hidden data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75"
    as="div"
    modal={false}
  >
    {children}
  </MenuItems>
);
