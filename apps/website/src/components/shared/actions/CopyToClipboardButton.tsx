import { useCallback } from "react";

import {
  type CopyToClipboardOptions,
  useCopyToClipboard,
} from "@/hooks/clipboard";

import IconClipboard from "@/icons/IconClipboard";

import ActionButton from "./ActionButton";

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
    <ActionButton
      onClick={onClick}
      icon={IconClipboard}
      tooltip={{ text: statusText, force: status !== undefined }}
    />
  );
};

export default CopyToClipboardButton;
