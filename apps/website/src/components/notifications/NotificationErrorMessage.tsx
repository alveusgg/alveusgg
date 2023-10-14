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
      "hyphens-auto rounded-lg bg-red-100 p-4 leading-tight text-red-800",
      className,
    )}
  >
    {children}
  </div>
);
