import { useRouter } from "next/router";
import { useCallback } from "react";
import { z } from "zod";

import useLocalStorage from "@/hooks/storage";

const boolSchema = z.boolean();

const parseBoolean = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined) return undefined;

  const normalized = raw.trim().toLowerCase();
  // Treat a bare flag (`?pixels`) as enabled
  if (["", "1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
};

/**
 * A boolean option that is persisted in local storage, but can also be set
 * via a URL query parameter (e.g. `?pixels=1`), which takes precedence over
 * the stored value.
 *
 * Changing the option updates the stored value as well as the URL, so that
 * the current state can be shared (e.g. as a browser source URL). Values
 * matching the initial value are removed from the URL to keep it clean.
 */
const useUrlOption = (
  storageKey: string,
  queryKey: string,
  initial: boolean,
) => {
  const router = useRouter();
  const [stored, setStored] = useLocalStorage(storageKey, boolSchema, initial);

  const value = parseBoolean(router.query[queryKey]) ?? stored;

  const setValue = useCallback(
    (next: boolean) => {
      setStored(next);

      if (!router.isReady) return;

      const { [queryKey]: _, ...query } = router.query;
      if (next !== initial) query[queryKey] = next ? "1" : "0";
      router.replace({ query }, undefined, { shallow: true });
    },
    [router, queryKey, initial, setStored],
  );

  return [value, setValue] as const;
};

export default useUrlOption;
