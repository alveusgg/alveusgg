import type { HTMLProps } from "react";

import { classes } from "@/utils/classes";

const Text = ({
  className,
  children,
  ...props
}: HTMLProps<HTMLParagraphElement>) => {
  return (
    <p
      className={classes(
        "text-3xl text-stroke-2",
        className,
        "font-bold text-balance text-white",
      )}
      {...props}
    >
      {children}
    </p>
  );
};

export default Text;
