import { useEffect, useState } from "react";

export function useTimestamp(updateInterval = 1000) {
  const [timestamp, setTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setTimestamp(Date.now());
    }, updateInterval);
    return () => clearInterval(id);
  }, [updateInterval]);

  return timestamp;
}
