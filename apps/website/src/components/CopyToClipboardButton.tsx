import { useCallback } from "react";

import IconClipboard from "@/icons/IconClipboard";
import {
  useCopyToClipboard,
  type CopyToClipboardOptions,
} from "@/hooks/clipboard";
import { classes } from "@/utils/classes";

type CopyToClipboardButtonProps = {
  text: string;
  options?: CopyToClipboardOptions;
};

const CopyToClipboardButton = ({
  text,
  options,
}: CopyToClipboardButtonProps) => {
  const { copy, status, statusText } = useCopyToClipboard(options);
  const onClick = useCallback(async () => {
    await copy(text);
  }, [copy, text]);

  return (
    <div className="group relative inline-block">
      <button onClick={onClick} title="Copy to clipboard">
        <IconClipboard className="ml-2 inline size-4 cursor-pointer text-alveus-green-400 duration-300 hover:text-black" />
      </button>

      <span
        className={classes(
          "pointer-events-none absolute top-0 left-full ml-2 rounded-md bg-alveus-green-900 px-1 text-white transition-opacity duration-300",
          status === undefined ? "opacity-0" : "opacity-100",
          "group-hover:opacity-100",
        )}
      >
        {statusText}
      </span>
    </div>
  );
};

export default CopyToClipboardButton;
