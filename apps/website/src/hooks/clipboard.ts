import { useCallback, useEffect, useMemo, useState } from "react";

export type CopyToClipboardOptions = {
  timeToKeepStatus?: number;
};

export function useCopyToClipboard({
  timeToKeepStatus = 2_000,
}: CopyToClipboardOptions = {}) {
  const [status, setStatus] = useState<undefined | "success" | "error">();
  const statusText =
    status === "success" ? "Copied!" : status === "error" ? "Failed" : "Copy";
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
    } catch (err) {
      setStatus("error");
    }
  }, []);

  return useMemo(
    () => ({ copy, status, statusText }),
    [copy, status, statusText],
  );
}
