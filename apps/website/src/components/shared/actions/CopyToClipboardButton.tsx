import { useCallback, useMemo } from "react";

import {
  type CopyToClipboardOptions,
  useCopyToClipboard,
} from "@/hooks/clipboard";

import IconClipboard from "@/icons/IconClipboard";

import ActionButton from "./ActionButton";
import getActionPreviewTooltip from "./ActionPreviewTooltip";

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

  const PreviewTooltip = useMemo(() => getActionPreviewTooltip(text), [text]);

  return (
    <ActionButton
      onClick={onClick}
      icon={IconClipboard}
      tooltip={{
        text: statusText,
        elm: preview && !status ? PreviewTooltip : undefined,
        force: status !== undefined,
      }}
    />
  );
};

export default CopyToClipboardButton;
