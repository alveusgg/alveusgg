import { type MouseEventHandler } from "react";

import IconClipboard from "@/icons/IconClipboard";

type CopyButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
};

const CopyButton = ({ onClick }: CopyButtonProps) => (
  <button onClick={onClick}>
    <IconClipboard className="ml-2 inline h-4 w-4 cursor-pointer text-alveus-green-400 duration-700 hover:text-black" />
  </button>
);

export default CopyButton;
