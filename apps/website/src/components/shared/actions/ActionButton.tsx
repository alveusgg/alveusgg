import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

type ActionButtonProps = {
  onClick: () => void;
  icon: ({ className }: { className: string }) => ReactNode;
  alt: string;
  tooltip: {
    text: string;
    force: boolean;
  };
};

const ActionButton = ({
  onClick,
  icon: Icon,
  alt,
  tooltip,
}: ActionButtonProps) => (
  <div className="group relative inline-block">
    <button onClick={onClick} title={alt}>
      <Icon className="m-1 inline size-4 cursor-pointer text-alveus-green-400 group-hover:text-black" />
    </button>

    <span
      className={classes(
        "pointer-events-none absolute top-1/2 left-full z-10 -translate-y-1/2 rounded-md bg-alveus-green-900 px-1 text-white transition-opacity",
        tooltip.force ? "opacity-100" : "opacity-0",
        "group-hover:opacity-100",
      )}
    >
      {tooltip.text}
    </span>
  </div>
);

export default ActionButton;
