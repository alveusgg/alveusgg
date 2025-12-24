import { useCallback, useMemo } from "react";

import {
  type CopyToClipboardOptions,
  useCopyToClipboard,
} from "@/hooks/clipboard";

import IconClipboard from "@/icons/IconClipboard";

import ActionButton from "./ActionButton";
import ActionPreviewTooltip from "./ActionPreviewTooltip";

type CopyToClipboardButtonProps = {
  text: string;
  preview?: boolean;
  options?: CopyToClipboardOptions;
};

const CopyToClipboardButton = ({
  text,
  preview = false,
  options,
}: CopyToClipboardButtonProps) => {
  const { copy, status, statusText } = useCopyToClipboard(options);

  const onClick = useCallback(async () => {
    await copy(text);
  }, [copy, text]);

  const content = useMemo(
    () =>
      preview && !status ? (
        <ActionPreviewTooltip preview={text}>{statusText}</ActionPreviewTooltip>
      ) : (
        statusText
      ),
    [preview, text, status, statusText],
  );

  return (
    <ActionButton
      onClick={onClick}
      icon={IconClipboard}
      tooltip={{
        content,
        aria: statusText,
        force: status !== undefined,
      }}
    />
  );
};

export default CopyToClipboardButton;
