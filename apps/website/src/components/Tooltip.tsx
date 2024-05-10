import type { ReactNode } from "react";
const Tooltip: React.FC<{ children: ReactNode; isTooltipOpen: boolean }> = ({
  children,
  isTooltipOpen,
}) => {
  return (
    isTooltipOpen && (
      <span className="ml-2 rounded-md bg-alveus-green-900 p-1 not-italic text-white">
        {children}
      </span>
    )
  );
};
export default Tooltip;
