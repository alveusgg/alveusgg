import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
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
      <Popover.Button className={classes("flex gap-2", className)}>
        <Icon />
        <span className={classes(!showLabel && "sr-only")}>
          Push Notifications on this device
        </span>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Popover.Panel
          className={classes(
            `absolute z-30 -mt-0.5 flex min-w-[240px] max-w-[calc(80vw-50px)] flex-col gap-0.5 rounded border border-black/20 bg-alveus-green-900 text-gray-200 shadow-lg`,
            openDirectionX === "left" ? "right-0" : "left-0",
            openDirectionY === "top" ? "bottom-full" : "top-full",
          )}
        >
          <NotificationSettings />

          <div className="mx-2 border-t opacity-30"></div>

          <p className="px-2 pb-2">
            <Popover.Button
              as={Link}
              href="/updates"
              className={navLinkClassesSub}
            >
              Show all updates
              <IconChevronRight
                className="-mt-px ml-1 inline-block"
                size={18}
              />
            </Popover.Button>
          </p>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
