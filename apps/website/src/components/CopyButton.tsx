import React from "react";
import IconClipboard from "@/icons/IconClipboard";

// Define the CopyButton component as a TypeScript function component
const CopyButton: React.FC<{ clickHandler: () => void }> = ({
  clickHandler,
}) => {
  return (
    <button onClick={clickHandler}>
      <IconClipboard />
    </button>
  );
};

export default CopyButton;
