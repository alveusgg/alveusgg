import { useCallback, useEffect, useMemo, useState } from "react";

export type CopyToClipboardOptions = {
  initialText?: string;
  timeToKeepStatus?: number;
};

export function useCopyToClipboard({
  initialText = "Copy",
  timeToKeepStatus = 2_000,
}: CopyToClipboardOptions = {}) {
  const [status, setStatus] = useState<undefined | "success" | "error">();
  const statusText =
    status === "success"
      ? "Copied!"
      : status === "error"
        ? "Failed"
        : initialText;
  useEffect(() => {
    if (status !== undefined) {
      const timeout = setTimeout(() => {
        setStatus(undefined);
      }, timeToKeepStatus);
      return () => clearTimeout(timeout);
    }
  }, [status, timeToKeepStatus]);

  const copy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("success");
    } catch (_) {
      setStatus("error");
    }
  }, []);

  return useMemo(
    () => ({ copy, status, statusText }),
    [copy, status, statusText],
  );
}
