import type { ComponentType } from "react";

import socials, { type SocialLink } from "@/data/socials";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries } from "@/utils/helpers";

import { NotificationsButton } from "@/components/notifications/NotificationsButton";

import type { IconProps } from "@/icons/BaseIcon";
import { getSocialIcon } from "@/icons/SocialIcon";

import UserMenuDesktop from "./UserMenuDesktop";

export const utilityLinkClasses =
  "block p-2 text-white bg-transparent rounded-xl transition-colors hover:bg-white hover:text-alveus-green";

const Divider = ({ className }: { className?: string }) => (
  <div className={classes("mx-1 h-6 border-r opacity-70", className)} />
);

export type UtilityNavItem = SocialLink & {
  key: string;
  Icon: ComponentType<IconProps>;
  rel: string;
};

const utilityNavStructure: UtilityNavItem[] = typeSafeObjectEntries(socials)
  .filter(([, { isLiveStream }]) => !isLiveStream)
  .map(([key, value]) => ({
    key,
    ...value,
    Icon: getSocialIcon(key),
    rel: "noreferrer me",
  }));

const liveNavStructure: UtilityNavItem[] = typeSafeObjectEntries(socials)
  .filter(([, { isLiveStream }]) => isLiveStream)
  .map(([key, value]) => ({
    key,
    ...value,
    Icon: getSocialIcon(key),
    rel: "noreferrer me",
  }));

const Section = ({ items }: { items: UtilityNavItem[] }) => (
  <>
    {items.map(({ key, rel, link, title, Icon }) => (
      <li key={key}>
        {/* eslint-disable-next-line react/jsx-no-target-blank */}
        <a
          className={utilityLinkClasses}
          target="_blank"
          rel={rel}
          href={link}
          title={title}
        >
          <Icon size={24} />
          <span className="sr-only">Open Alveus&apos; {title}</span>
        </a>
      </li>
    ))}
  </>
);

export const UtilityMenu = ({ mode }: { mode: "desktop" | "mobile" }) => (
  <div className="flex flex-row flex-wrap items-center justify-center gap-1 md:gap-2">
    <ul className="flex flex-row flex-wrap items-center justify-center gap-0.5 sm:gap-1 md:gap-2">
      <Section items={utilityNavStructure} />
    </ul>
    <Divider className="max-sm:hidden" />
    <div className="-my-0.5 flex flex-row items-center gap-0.5 rounded-xl bg-black/30 p-0.5 ring-2 ring-black/10 backdrop-blur-sm">
      <div className="inline-flex items-center gap-0.5 rounded-sm pr-1 pl-2 text-xs font-bold text-white md:gap-1">
        <span className="relative inline-flex size-2">
          <span className="absolute inline-flex size-full animate-live-pulse rounded-full bg-current ring-1 ring-current"></span>
          <span className="absolute inline-flex size-full rounded-full bg-current"></span>
        </span>
        <span className="max-sm:hidden">LIVE</span>
      </div>
      <ul className="contents">
        <Section items={liveNavStructure} />
      </ul>
    </div>
    {mode === "desktop" && (
      <>
        <Divider />
        <NotificationsButton className={utilityLinkClasses} />
        <Divider />
        <UserMenuDesktop />
      </>
    )}
  </div>
);
