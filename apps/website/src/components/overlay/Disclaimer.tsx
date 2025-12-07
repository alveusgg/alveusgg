import type { HTMLProps } from "react";

import { classes } from "@/utils/classes";

const Disclaimer = ({
  className,
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
        "font-bold text-white",
      )}
      {...props}
    >
      The rescued animals on screen are educational ambassadors, not pets!
    </p>
  );
};

export default Disclaimer;
