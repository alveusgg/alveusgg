import type { ReactNode } from "react";

import { classes } from "@/utils/classes";

const Front = ({
  size,
  left,
  right,
  children,
}: {
  size: 1 | 2;
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}) => {
  return (
    <div
      className={classes(
        // Rack width is 19 inches, 1U is 1.75 inches, 2U is 3.5 inches
        size === 1 ? "aspect-[19/1.75]" : "aspect-[19/3.5]",
        "@container flex w-full gap-[0.25cqw] rounded-sm bg-gray-400 p-[0.25cqw]",
      )}
    >
      <div className="w-1/25">{left}</div>
      <div className="grow">{children}</div>
      <div className="w-1/25">{right}</div>
    </div>
  );
};

const Server = ({
  size,
  left,
  right,
  children,
}: {
  size: 1 | 2;
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}) => (
  <Front size={size} left={left} right={right}>
    {children}
  </Front>
);

export default Server;
