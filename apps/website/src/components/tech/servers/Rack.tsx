import type { ReactNode } from "react";

import { classes } from "@/utils/classes";

const Rack = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={classes(
        "relative flex flex-col gap-1 py-2 *:drop-shadow-md lg:py-4",
        className,
      )}
    >
      <div className="absolute inset-y-0 left-0 -z-10 flex w-[4%] justify-center drop-shadow-none">
        <div className="h-full w-3/4 rounded-sm bg-gray-200" />
      </div>
      <div className="absolute inset-y-0 right-0 -z-10 flex w-[4%] justify-center drop-shadow-none">
        <div className="h-full w-3/4 rounded-sm bg-gray-200" />
      </div>
      {children}
    </div>
  );
};
export default Rack;
