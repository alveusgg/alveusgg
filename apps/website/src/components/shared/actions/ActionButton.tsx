import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

import useTooltip, { type UseTooltipProps } from "@/hooks/tooltip";

type ActionButtonProps = {
  onClick: () => void;
  icon: ({ className }: { className: string }) => ReactNode;
  tooltip: UseTooltipProps;
  className?: string;
};

const ActionButton = ({
  onClick,
  icon: Icon,
  tooltip,
  className,
}: ActionButtonProps) => {
  const { props: ttProps, element: ttElm } = useTooltip(tooltip);

  return (
    <button
      onClick={onClick}
      className={classes(
        "group",
        !/\b(relative|absolute|fixed|sticky)\b/.test(className || "") &&
          "relative",
        !/\b((inline-)?(block|flex|grid|table)|inline|contents)\b/.test(
          className || "",
        ) && "inline-block",
        !/\btext-/.test(className || "") &&
          "text-alveus-green-400 hover:text-black",
        className,
      )}
      {...ttProps}
    >
      {ttElm}
      <Icon className="m-1 size-5 cursor-pointer transition-colors" />
    </button>
  );
};

export default ActionButton;
