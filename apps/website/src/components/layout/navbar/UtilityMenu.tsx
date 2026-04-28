import { classes } from "@/utils/classes";
import { typeSafeObjectEntries } from "@/utils/helpers";

import { NotificationsButton } from "@/components/notifications/NotificationsButton";
import socialsLinks, {
  type SocialLinkWithIcon,
} from "@/components/shared/data/socials";

import UserMenuDesktop from "./UserMenuDesktop";

export const utilityLinkClasses =
  "block p-2 text-white bg-transparent rounded-xl transition-colors hover:bg-white hover:text-alveus-green";

const Divider = ({ className }: { className?: string }) => (
  <div className={classes("mx-1 h-6 border-r opacity-70", className)} />
);

export type UtilityNavItem = SocialLinkWithIcon & {
  key: string;
  rel: string;
};

const linkEntries = typeSafeObjectEntries(socialsLinks);

const utilityNavStructure: UtilityNavItem[] = linkEntries
  .filter(([, { live }]) => !live)
  .map(([key, value]) => ({
    key,
    rel: "noreferrer me",
    ...value,
  }));

const liveNavStructure: UtilityNavItem[] = linkEntries
  .filter(([, { live }]) => live)
  .map(([key, value]) => ({
    key,
    rel: "noreferrer me",
    ...value,
  }));

const Section = ({ items }: { items: UtilityNavItem[] }) => (
  <>
    {items.map((item) => (
      <li key={item.key}>
        {/* eslint-disable-next-line react/jsx-no-target-blank */}
        <a
          className={utilityLinkClasses}
          target="_blank"
          rel={item.rel}
          href={item.link}
          title={item.title}
        >
          <item.icon size={24} />
          <span className="sr-only">Open Alveus&apos; {item.title}</span>
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
      <div className="inline-flex items-center gap-0.5 rounded-sm pr-1 pl-3 text-xs font-bold text-white md:gap-1">
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
