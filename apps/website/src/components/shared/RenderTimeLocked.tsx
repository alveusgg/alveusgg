import { type ReactNode, useEffect, useState } from "react";

function useIsTimeLocked(lockedUntil: Date | undefined) {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!lockedUntil) {
      setLocked(false);
      return;
    }

    const lock = lockedUntil.getTime();
    const timeToUnlock = lock - Date.now();
    if (timeToUnlock <= 0) {
      setLocked(false);
      return;
    }

    setLocked(true);
    const id = setTimeout(() => {
      setLocked(false);
    }, timeToUnlock);
    return () => clearTimeout(id);
  }, [lockedUntil]);

  return locked;
}

export function RenderTimeLocked(props: {
  children: (locked: boolean) => ReactNode;
  lockedUntil: Date | undefined;
}) {
  const isLocked = useIsTimeLocked(props.lockedUntil);
  return props.children(isLocked);
}
