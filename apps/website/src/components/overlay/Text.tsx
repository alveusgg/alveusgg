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
        className,
        !/(^|\s)text-(xs|sm|base|lg|[2-6]?xl)(\s|$)/.test(className || "") &&
          "text-3xl",
        !/(^|\s)text-stroke(-\d+)?(\s|$)/.test(className || "") &&
          "text-stroke-2",
        "font-bold text-balance text-white",
      )}
      {...props}
    >
      {children}
    </p>
  );
};

export default Text;
