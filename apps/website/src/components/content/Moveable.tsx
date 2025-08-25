import { useCallback, useEffect, useState } from "react";

import { classes } from "@/utils/classes";
import { safeJSONParse } from "@/utils/helpers";

const Moveable = ({
  fixed = false,
  store,
  className,
  children,
}: {
  fixed?: boolean;
  store?: string;
  className?: string;
  children: React.ReactNode;
}) => {
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const position = (x?: number, y?: number) => {
        const rect = node.getBoundingClientRect();
        const left = Math.max(
          0,
          Math.min(
            (fixed
              ? document.documentElement.clientWidth
              : document.body.scrollWidth) - rect.width,
            x ?? node.offsetLeft,
          ),
        );
        const top = Math.max(
          0,
          Math.min(
            (fixed
              ? document.documentElement.clientHeight
              : document.body.scrollHeight) - rect.height,
            y ?? node.offsetTop,
          ),
        );
        if (store)
          localStorage.setItem(
            `moveable:${store}`,
            JSON.stringify({ left, top }),
          );

        node.style.left = `${left}px`;
        node.style.top = `${top}px`;
        node.style.right = "auto";
        node.style.bottom = "auto";
      };

      let initialX: number | undefined, initialY: number | undefined;
      if (store) {
        const saved = localStorage.getItem(`moveable:${store}`);
        const parsed = safeJSONParse(saved ?? "");
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "left" in parsed &&
          typeof parsed.left === "number" &&
          "top" in parsed &&
          typeof parsed.top === "number"
        ) {
          initialX = parsed.left;
          initialY = parsed.top;
        }
      }
      position(initialX, initialY);

      const mouseDown = (event: MouseEvent) => {
        event.preventDefault();

        const startX = event.clientX;
        const startY = event.clientY;
        const startLeft = node.offsetLeft;
        const startTop = node.offsetTop;

        const mouseMove = (moveEvent: MouseEvent) => {
          moveEvent.preventDefault();
          position(
            startLeft + (moveEvent.clientX - startX),
            startTop + (moveEvent.clientY - startY),
          );
        };

        const mouseUp = () => {
          document.removeEventListener("mousemove", mouseMove);
          document.removeEventListener("mouseup", mouseUp);
        };

        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("mouseup", mouseUp);
      };

      const resize = () => position();

      node.addEventListener("mousedown", mouseDown);
      document.addEventListener("resize", resize);

      return () => {
        node.removeEventListener("mousedown", mouseDown);
        document.removeEventListener("resize", resize);
      };
    },
    [fixed, store],
  );

  const [shift, setShift] = useState(false);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") setShift(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") setShift(false);
    };

    const focus = () => {
      setShift(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("focus", focus, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("focus", focus, true);
    };
  }, []);

  return (
    <div
      className={classes(
        "cursor-move select-none",
        fixed ? "fixed" : "absolute",
        !shift && "*:pointer-events-none",
        className,
      )}
      ref={ref}
    >
      {children}
    </div>
  );
};

export default Moveable;
