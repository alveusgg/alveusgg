import type { ReactNode } from "react";

import { classes } from "@/utils/classes";

import { tooltipClasses } from "@/hooks/tooltip";

const ActionPreviewTooltip = ({
  children,
  preview,
}: {
  children: ReactNode;
  preview: ReactNode;
}) => (
  <div className={classes("flex flex-col", tooltipClasses)}>
    <span>{children}</span>
    <span className="font-mono text-xs text-alveus-green-300">{preview}</span>
  </div>
);

export default ActionPreviewTooltip;
