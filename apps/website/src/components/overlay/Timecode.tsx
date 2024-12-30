import { useEffect, useRef, useState } from "react";

import { classes } from "@/utils/classes";

const Timecode = ({ className }: { className?: string }) => {
  // Get the current minutes/seconds as a binary code
  // Refresh every 250ms
  const [bits, setBits] = useState<string[]>();
  const interval = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    const update = () => {
      const date = new Date();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      setBits((minutes * 60 + seconds).toString(2).padStart(12, "0").split(""));
    };

    update();
    interval.current = setInterval(update, 250);
    return () => clearInterval(interval.current ?? undefined);
  }, []);

  return (
    <div className={classes(className, "grid grid-cols-12")}>
      {bits?.map((bit, idx) => (
        <div
          key={`${bit}-${idx}`}
          className={classes(
            "size-1",
            bit === "0" ? "bg-gray-400" : "bg-alveus-tan-800",
          )}
        />
      ))}
    </div>
  );
};

export default Timecode;
