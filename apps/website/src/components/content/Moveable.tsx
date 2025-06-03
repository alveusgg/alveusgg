import { useCallback, useEffect, useState } from "react";

import { classes } from "@/utils/classes";

const Moveable = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const position = (x?: number, y?: number) => {
      const rect = node.getBoundingClientRect();
      node.style.left = `${Math.max(0, Math.min(document.body.clientWidth - rect.width, x ?? node.offsetLeft))}px`;
      node.style.top = `${Math.max(0, Math.min(document.body.scrollHeight - rect.height, y ?? node.offsetTop))}px`;
      node.style.right = "auto";
      node.style.bottom = "auto";
    };

    position();

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
  }, []);

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
        "absolute cursor-move select-none",
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
