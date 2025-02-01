import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Link from "next/link";

import { classes } from "@/utils/classes";
import IconNotification from "@/icons/IconNotification";
import IconNotificationOn from "@/icons/IconNotificationOn";
import IconNotificationOff from "@/icons/IconNotificationOff";
import IconChevronRight from "@/icons/IconChevronRight";

import {
  NotificationSettings,
  useNotificationStatus,
} from "@/components/notifications/NotificationSettings";
import { navLinkClassesSub } from "@/components/layout/navbar/NavLink";

export const NotificationsButton = ({
  openDirectionX = "left",
  openDirectionY = "bottom",
  showLabel = false,
  className,
  containerClassName,
}: {
  openDirectionX?: "left" | "right";
  openDirectionY?: "top" | "bottom";
  showLabel?: boolean;
  className?: string;
  containerClassName?: string;
}) => {
  const perms = useNotificationStatus().notificationPermission;

  let Icon;
  switch (perms) {
    case false:
    case "denied":
      Icon = IconNotificationOff;
      break;
    case "granted":
      Icon = IconNotificationOn;
      break;
    default:
      Icon = IconNotification;
  }

  return (
    <Popover
      as="div"
      className={classes("relative flex items-center", containerClassName)}
    >
      <PopoverButton
        className={classes("flex gap-2", className)}
        title={!showLabel ? "Push Notifications" : undefined}
      >
        <Icon />

        {showLabel && <span>Push Notifications on this device</span>}
      </PopoverButton>

      <PopoverPanel
        transition
        className={classes(
          `absolute z-30 -mt-0.5 flex min-w-[240px] max-w-fit flex-col gap-0.5 rounded-sm border border-black/20 bg-alveus-green-900 text-gray-200 shadow-lg transition ease-in-out data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[closed]:scale-95 md:max-w-[calc(80vw-50px)]`,
          openDirectionX === "left" ? "right-0" : "left-0",
          openDirectionY === "top" ? "bottom-full" : "top-full",
        )}
        modal={false}
      >
        <NotificationSettings />

        <div className="mx-2 border-t opacity-30"></div>

        <p className="px-2 pb-2">
          <PopoverButton
            as={Link}
            href="/updates"
            className={navLinkClassesSub}
          >
            Show all updates
            <IconChevronRight className="-mt-px ml-1 inline-block" size={18} />
          </PopoverButton>
        </p>
      </PopoverPanel>
    </Popover>
  );
};
