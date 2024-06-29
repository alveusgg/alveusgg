import type { ReactNode } from "react";
type TooltipProps = { children: ReactNode; isOpen: boolean };
const InlineInfoBox = ({ children, isOpen }: TooltipProps) => {
  return (
    isOpen && (
      <span className="ml-2 rounded-md bg-alveus-green-900 p-1 not-italic text-white">
        {children}
      </span>
    )
  );
};
export default InlineInfoBox;
