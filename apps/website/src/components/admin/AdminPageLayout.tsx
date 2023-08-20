import React from "react";
import Link, { type LinkProps } from "next/link";

import { classes } from "@/utils/classes";

import { type DefaultPageLayoutProps } from "@/components/DefaultPageLayout";
import { useIsActivePath } from "@/components/shared/hooks/useIsActivePath";

export type AdminMenuItem = {
  label: string;
  href: string;
};

export type AdminPageLayoutProps = DefaultPageLayoutProps & {
  menuItems: Array<AdminMenuItem>;
};

type NavLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>;
const NavLink: React.FC<NavLinkProps> = (props) => {
  const isActive = useIsActivePath(props.href);

  return (
    <Link
      {...props}
      className={classes(
        "rounded-2xl px-4 py-2 hover:bg-black/30 focus:bg-black/30",
        props.className,
        isActive && "bg-black/20",
      )}
    />
  );
};

export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  children,
  title,
  menuItems,
  ...props
}) => {
  return (
    <>
      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-gray-900 lg:block" />

      <div
        {...props}
        className="flex flex-grow flex-col border-b border-black bg-gray-800 text-gray-200"
      >
        <h1 className="border-b border-black bg-gray-900 p-4 text-xl font-semibold">
          Admin / {title}
        </h1>
        <div className="flex flex-1 flex-row">
          <nav className="w-[200px] border-r border-black p-3">
            <ul className="flex flex-col justify-stretch gap-1">
              {menuItems.map(({ href, label }) => (
                <NavLink key={href} href={href}>
                  {label}
                </NavLink>
              ))}
            </ul>
          </nav>

          <div className="flex-1 p-4">
            <div>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};
