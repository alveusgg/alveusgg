import type { ReactNode } from "react";

const ActionPreviewTooltip = ({
  children,
  preview,
}: {
  children: ReactNode;
  preview: ReactNode;
}) => (
  <div className="flex flex-col">
    <span>{children}</span>
    <span className="font-mono text-xs text-alveus-green-300">{preview}</span>
  </div>
);

export default ActionPreviewTooltip;
