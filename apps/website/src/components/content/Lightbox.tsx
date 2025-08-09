import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { classes } from "@/utils/classes";
import { visibleUnderCursor } from "@/utils/dom";

import IconX from "@/icons/IconX";

import Carousel from "./Carousel";

type LightboxProps = {
  open?: string;
  onClose: () => void;
  items: Record<string, ReactNode>;
  className?: string;
};

const Lightbox = ({ open, onClose, items, className }: LightboxProps) => {
  // Whenever the lightbox opens, we want to scroll to the item that was opened
  const [scrollTo, setScrollTo] = useState<string>();
  useEffect(() => {
    setScrollTo(open);
  }, [open]);

  // When items render in the carousel, scroll to the item that was opened
  const itemsRef = useCallback(
    (refs: Record<string, HTMLDivElement>) => {
      if (!scrollTo) return;

      const item = refs[scrollTo];
      if (item) {
        item.scrollIntoView({ behavior: "instant", block: "nearest" });
        setScrollTo(undefined);
      }
    },
    [scrollTo],
  );

  // Allow clicks that go through to the backdrop to close the lightbox
  // Except when the click is part of a drag operation
  const backdropRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const onMouseDown = useCallback((e: MouseEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDragging.current = false;
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStartPos.current) return;

    const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
    const deltaY = Math.abs(e.clientY - dragStartPos.current.y);

    // Consider it a drag if the mouse has moved more than 5 pixels in any direction
    if (deltaX > 5 || deltaY > 5) {
      isDragging.current = true;
    }
  }, []);

  const onMouseUp = useCallback(() => {
    dragStartPos.current = null;

    // Reset isDragging after a short delay to allow click event to fire
    setTimeout(() => {
      isDragging.current = false;
    }, 0);
  }, []);

  const onClick = useCallback(
    (e: MouseEvent) => {
      // Don't close if this click was part of a drag operation
      if (isDragging.current) return;

      const elm = visibleUnderCursor(e.nativeEvent);
      if (elm && backdropRef.current && elm === backdropRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      className={classes("fixed inset-0 z-100", className)}
      onClickCapture={onClick}
      onMouseDownCapture={onMouseDown}
      onMouseMoveCapture={onMouseMove}
      onMouseUpCapture={onMouseUp}
    >
      <DialogBackdrop
        className="absolute inset-0 bg-black/75"
        ref={backdropRef}
      />

      <div className="absolute inset-0 p-1 md:p-4 lg:p-8">
        <DialogPanel className="size-full">
          <Carousel
            items={items}
            auto={null}
            className="h-full"
            buttonClassName="px-0 py-6 my-auto text-alveus-tan [&>svg]:size-8 lg:[&>svg]:size-12 hover:text-alveus-green-400"
            itemClassName="basis-full max-w-full"
            itemsRef={itemsRef}
          />

          <button
            type="button"
            aria-label="Close"
            className="absolute top-4 right-4 z-50 text-alveus-tan transition-colors hover:text-alveus-green-400"
            onClick={onClose}
          >
            <IconX size={32} />
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Lightbox;
