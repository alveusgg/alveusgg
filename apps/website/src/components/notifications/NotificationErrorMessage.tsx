import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

export const NotificationErrorMessage = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={classes(
      "rounded-lg bg-red-100 p-4 leading-tight hyphens-auto text-red-800",
      className,
    )}
  >
    {children}
  </div>
);
