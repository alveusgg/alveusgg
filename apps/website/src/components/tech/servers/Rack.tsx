import type { ReactNode } from "react";

import { classes } from "@/utils/classes";

const Rack = ({
  sticky = "top",
  className,
  children,
}: {
  sticky?: "top" | "bottom";
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={classes(
        "relative flex flex-col",
        sticky === "top" ? "justify-start" : "justify-end",
        className,
      )}
    >
      <div className="absolute inset-y-0 left-0 -z-10 flex w-[4%] justify-center">
        <div className="h-full w-3/4 rounded-sm bg-gray-200" />
      </div>
      <div className="absolute inset-y-0 right-0 -z-10 flex w-[4%] justify-center">
        <div className="h-full w-3/4 rounded-sm bg-gray-200" />
      </div>
      <div
        className={classes(
          "sticky flex flex-col gap-1 py-2 *:drop-shadow-md lg:py-4",
          sticky === "top" ? "top-0" : "bottom-0",
        )}
      >
        {children}
      </div>
    </div>
  );
};
export default Rack;
