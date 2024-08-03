import { type ReactNode } from "react";

type InlineInfoBoxProps = {
  children: ReactNode;
  isOpen: boolean;
};

const InlineInfoBox = ({ children, isOpen }: InlineInfoBoxProps) =>
  isOpen && (
    <span className="ml-2 rounded-md bg-alveus-green-900 p-1 not-italic text-white">
      {children}
    </span>
  );

export default InlineInfoBox;
