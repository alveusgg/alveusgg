import { useCallback, useEffect, useState } from "react";
import type { ZodType } from "zod";

import { safeJSONParse } from "@/utils/helpers";

const useLocalStorage = <T>(
  key: string,
  schema: ZodType<T>,
  initial: T,
  onFetch?: (newValue: T) => void,
) => {
  const [stored, setStored] = useState<T>(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const item = localStorage.getItem(key);
    if (!item) return;

    const parsed = safeJSONParse(item);
    const result = schema.safeParse(parsed);
    if (result.success) {
      setStored(result.data);
      if (onFetch) {
        onFetch(result.data);
      }
    }
  }, [key, schema, onFetch]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStored((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== "undefined") {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    },
    [key],
  );

  return [stored, setValue] as const;
};

export default useLocalStorage;
