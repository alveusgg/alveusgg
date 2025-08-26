import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

type ActionButtonProps = {
  onClick: () => void;
  icon: ({ className }: { className: string }) => ReactNode;
  tooltip: {
    text: string;
    elm?: ({
      className,
      children,
    }: {
      className: string;
      children: string;
    }) => ReactNode;
    force?: boolean;
  };
  className?: string;
};

const ActionButton = ({
  onClick,
  icon: Icon,
  tooltip,
  className,
}: ActionButtonProps) => {
  const Tooltip = tooltip.elm ?? "div";
  return (
    <div
      className={classes(
        "group relative",
        !/\b((inline-)?(block|flex|grid|table)|inline|contents)\b/.test(
          className || "",
        ) && "inline-block",
        !/\btext-/.test(className || "") &&
          "text-alveus-green-400 hover:text-black",
        className,
      )}
    >
      <Tooltip
        className={classes(
          "pointer-events-none absolute top-1/2 z-10 -translate-x-full -translate-y-1/2 rounded-md bg-alveus-green-900 px-1 py-0.5 leading-tight text-nowrap text-white transition-opacity",
          tooltip.force ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          /\bbg-/.test(className || "") ? "-left-1" : "left-0",
        )}
      >
        {tooltip.text}
      </Tooltip>
      <button onClick={onClick} title={tooltip.text}>
        <Icon className="m-1 size-5 cursor-pointer transition-colors" />
      </button>
    </div>
  );
};

export default ActionButton;
