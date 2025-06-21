import type { ReactNode } from "react";

import { classes } from "@/utils/classes";

const Front = ({
  size,
  background,
  title,
  left,
  right,
  children,
}: {
  size: 1 | 2;
  background?: string;
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}) => {
  const empty = !left && !right && !children;
  return (
    <div
      className={classes(
        // Rack width is 19 inches, 1U is 1.75 inches, 2U is 3.5 inches
        size === 1 ? "aspect-[19/1.75]" : "aspect-[19/3.5]",
        background || "bg-gray-400",
        !empty && "@container flex gap-[0.25cqw] p-[0.25cqw]",
        "w-full rounded-sm",
      )}
      title={title}
    >
      {!empty && (
        <>
          <div className="w-1/25">{left}</div>
          <div className="grow">{children}</div>
          <div className="w-1/25">{right}</div>
        </>
      )}
    </div>
  );
};

const Server = ({
  size,
  background,
  title,
  left,
  right,
  children,
}: {
  size: 1 | 2;
  background?: string;
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}) => (
  <Front
    size={size}
    background={background}
    title={title}
    left={left}
    right={right}
  >
    {children}
  </Front>
);

export default Server;
