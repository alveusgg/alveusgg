import { useCallback, useRef } from "react";

const useRefs = <T,>() => {
  // Store refs to every trigger
  const { current: refs } = useRef<Record<string, T>>({});

  // When a ref changes, update the stored ref
  const setRef = useCallback(
    (key: string, ref: T | null) => {
      // If we have a new ref, store it
      if (ref) {
        refs[key] = ref;
        return;
      }

      // If we have a ref stored, remove it
      if (refs[key]) {
        delete refs[key];
        return;
      }
    },
    [refs],
  );

  return { refs, setRef };
};

export default useRefs;
