import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

type ActionButtonProps = {
  onClick: () => void;
  icon: ({ className }: { className: string }) => ReactNode;
  tooltip: {
    text: string;
    force: boolean;
  };
};

const ActionButton = ({ onClick, icon: Icon, tooltip }: ActionButtonProps) => (
  <div className="group relative inline-block">
    <span
      className={classes(
        "pointer-events-none absolute top-1/2 right-full z-10 -translate-y-1/2 rounded-md bg-alveus-green-900 px-1 text-nowrap text-white transition-opacity",
        tooltip.force ? "opacity-100" : "opacity-0",
        "group-hover:opacity-100",
      )}
    >
      {tooltip.text}
    </span>
    <button onClick={onClick} title={tooltip.text}>
      <Icon className="m-1 inline size-5 cursor-pointer text-alveus-green-400 group-hover:text-black" />
    </button>
  </div>
);

export default ActionButton;
