import React from "react";
import Link, { type LinkProps } from "next/link";
import DefaultPageLayout, {
  type DefaultPageLayoutProps,
} from "../DefaultPageLayout";
import { useIsActivePath } from "../shared/hooks/useIsActivePath";

export type AdminPageLayoutProps = DefaultPageLayoutProps;

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
      className={`rounded-2xl px-4 py-2 hover:bg-black/30 focus:bg-black/30 ${
        props.className || ""
      } ${isActive ? "bg-black/20" : ""}`}
    />
  );
};

export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  children,
  title,
  ...props
}) => {
  return (
    <DefaultPageLayout title={`Admin / ${title}`} {...props}>
      <nav className="my-4 flex flex-row gap-4">
        <NavLink href="/admin/dashboard">Dashboard</NavLink>
        <NavLink href="/admin/activity-feed">Activity Feed</NavLink>
      </nav>

      {children}
    </DefaultPageLayout>
  );
};
