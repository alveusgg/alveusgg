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
    <div className={classes("relative", className)}>
      <div className="absolute inset-y-0 left-0 -z-10 flex w-[4%] justify-center">
        <div className="h-full w-3/4 rounded-sm bg-gray-200" />
      </div>
      <div className="absolute inset-y-0 right-0 -z-10 flex w-[4%] justify-center">
        <div className="h-full w-3/4 rounded-sm bg-gray-200" />
      </div>
      <div className="sticky top-0 flex flex-col gap-1 py-2 *:drop-shadow-md lg:py-4">
        {children}
      </div>
    </div>
  );
};
export default Rack;
