import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useCallback, useMemo, useRef } from "react";

import type { DonationAlert } from "@alveusgg/donations-core";

import { PIXEL_SIZE, useLivePixels } from "@/hooks/pixels";

import { coordsToGridRef } from "@/components/institute/Pixels";

function PixelsAlert() {
  const [scope, animate] = useAnimate();

  const donationInfoRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLParagraphElement>(null);
  const pixelRevealerRef = useRef<SVGSVGElement>(null);
  const pixelRef = useRef<HTMLDivElement>(null);
  const pixelTitleRef = useRef<HTMLHeadingElement>(null);
  const multiplierRef = useRef<HTMLSpanElement>(null);
  const multiplierTextRef = useRef<HTMLSpanElement>(null);
  const pixelImageCanvasRef = useRef<HTMLCanvasElement>(null);
  const currentAlertIdentifierRef = useRef<HTMLParagraphElement>(null);
  const currentAlertAmountRef = useRef<HTMLSpanElement>(null);

  const trigger = useMemo(
    () => async (info: DonationAlert & { id: string }) => {
      if (!donationInfoRef.current)
        throw new Error("Donation info ref is not found");
      if (!amountRef.current) throw new Error("Amount ref is not found");
      if (!currentAlertIdentifierRef.current)
        throw new Error("Current alert identifier ref is not found");
      if (!currentAlertAmountRef.current)
        throw new Error("Current alert amount ref is not found");
      if (!multiplierTextRef.current)
        throw new Error("Multiplier text ref is not found");
      if (!pixelRevealerRef.current)
        throw new Error("Pixel revealer ref is not found");
      if (!pixelRef.current) throw new Error("Pixel ref is not found");
      if (!pixelTitleRef.current)
        throw new Error("Pixel title ref is not found");

      if (!multiplierRef.current)
        throw new Error("Multiplier ref is not found");
      if (!multiplierTextRef.current)
        throw new Error("Multiplier text ref is not found");
      if (!pixelImageCanvasRef.current)
        throw new Error("Pixel image ref is not found");

      currentAlertIdentifierRef.current.innerText = info.identifier;
      currentAlertAmountRef.current.innerText = `$${(info.amount / 100).toFixed(2)}`;
      multiplierTextRef.current.innerText = "0";

      await animate([
        [
          donationInfoRef.current,
          { opacity: 0, scale: 0.8, y: 20 },
          { duration: 0 },
        ],
        [
          donationInfoRef.current,
          { opacity: 1, scale: 1, y: 0 },
          { ease: "anticipate" },
        ],
      ]);

      await animate([
        [amountRef.current, { fontSize: "3rem", opacity: 0 }, { duration: 0 }],
      ]);

      await animate(
        amountRef.current,
        { fontSize: "2.5rem", opacity: 1 },
        { ease: "anticipate" },
      );

      for (const pixel of info.pixels) {
        await animate([
          [multiplierRef.current, { opacity: 0, x: -20 }, { duration: 0 }],
          [
            pixelRevealerRef.current,
            { height: "105%", x: "-50%", y: "-2.5%" },
            { duration: 0 },
          ],
          [
            pixelRef.current,
            { opacity: 0, y: 40, scale: 0.8 },
            { duration: 0 },
          ],
          [pixelTitleRef.current, { opacity: 0, y: 40 }, { duration: 0 }],
        ]);

        const bytes = Uint8ClampedArray.from(atob(pixel.data), (c) =>
          c.charCodeAt(0),
        );
        const imageData = new ImageData(bytes, PIXEL_SIZE, PIXEL_SIZE);

        const ctx = pixelImageCanvasRef.current?.getContext("2d");
        if (!ctx) throw new Error("Pixel image canvas context is not found");
        ctx.putImageData(imageData, 0, 0);

        await animate(
          pixelRef.current,
          { scale: 1.05, rotate: [0, 1, -1, 1.8, -0.8, 0], opacity: 1, y: 0 },
          { ease: "easeInOut", duration: 1 },
        );

        let current = parseInt(multiplierTextRef.current.innerText);
        if (isNaN(current)) current = 0;
        current += 1;
        multiplierTextRef.current.innerText = current.toString();

        const label = coordsToGridRef({ x: pixel.column, y: pixel.row });
        pixelTitleRef.current.innerText = `${label.y}:${label.x}`;

        await Promise.all([
          animate([
            [
              multiplierRef.current,
              { scale: 1.4, rotate: 2, opacity: 1, x: 0 },
              { ease: "anticipate" },
            ],
            [
              multiplierRef.current,
              { scale: 1, rotate: 0 },
              { ease: "anticipate" },
            ],
          ]),
          animate(
            pixelRevealerRef.current,
            { x: "100%" },
            { ease: "easeInOut", duration: 1 },
          ),
          animate([
            [
              pixelRef.current,
              { scale: 1.15, rotate: 1 },
              { ease: "easeInOut", delay: 0.2 },
            ],
          ]),
          animate(
            pixelTitleRef.current,
            { opacity: 1, y: 0 },
            { ease: "anticipate" },
          ),
        ]);

        await animate([
          [multiplierRef.current, { opacity: 0, x: -20 }],
          [
            pixelRevealerRef.current,
            { height: "105%", x: "-50%", y: "-2.5%" },
            { duration: 0 },
          ],
          [pixelTitleRef.current, { opacity: 0, y: 40 }],
          [
            pixelRef.current,
            { opacity: 0, y: 40, scale: 0.8 },
            { duration: 0 },
          ],
        ]);
      }

      await animate(
        donationInfoRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        { ease: "anticipate" },
      );
    },
    [animate],
  );

  const pendingAlertQueueRef = useRef(createPromiseLock());
  const onEvent = useCallback(
    (alert: DonationAlert) => {
      pendingAlertQueueRef.current(async () => {
        await trigger({ ...alert, id: Math.random().toString() });
      });
    },
    [trigger],
  );

  useLivePixels({ onEvent });

  return (
    <AnimatePresence mode="wait">
      <div
        ref={scope}
        className="flex h-[300px] w-[400px] flex-col items-center justify-center gap-2 text-white text-stroke"
      >
        <motion.div
          layout="position"
          key="donation-info"
          ref={donationInfoRef}
          className="flex flex-col items-center justify-center -space-y-2"
        >
          <motion.p
            ref={currentAlertIdentifierRef}
            className="text-2xl"
          ></motion.p>
          <motion.p
            ref={amountRef}
            style={{ fontWeight: "bold" }}
            variants={{
              hidden: { fontSize: "3rem", opacity: 0 },
            }}
            initial="hidden"
          >
            <span ref={currentAlertAmountRef} />
          </motion.p>
        </motion.div>
        <motion.div
          layout="position"
          key="pixel-container"
          className="relative flex flex-col items-center justify-center gap-4"
        >
          <motion.span
            ref={multiplierRef}
            className="absolute top-12 -right-8 z-20 flex items-center"
            variants={{
              hidden: { opacity: 0, x: -20 },
            }}
            initial="hidden"
          >
            <span className="text-md">x</span>
            <span ref={multiplierTextRef} className="text-xl font-bold" />
          </motion.span>

          <motion.div
            className="h-[100px] w-[100px] overflow-hidden rounded-md bg-white p-1 ring ring-black"
            ref={pixelRef}
            variants={{
              hidden: { opacity: 0 },
            }}
            initial="hidden"
          >
            <motion.svg
              ref={pixelRevealerRef}
              variants={{
                hidden: { height: "105%", x: "-50%", y: "-2.5%" },
              }}
              initial="hidden"
              className="absolute"
              viewBox="0 0 40 20"
            >
              <path d="M0 20H40V0H19.8519L0 20Z" fill="white" />
            </motion.svg>
            <canvas
              ref={pixelImageCanvasRef}
              className="h-full w-full rounded-sm"
              style={{ imageRendering: "pixelated" }}
              width={PIXEL_SIZE}
              height={PIXEL_SIZE}
            ></canvas>
          </motion.div>
          <motion.h1
            className="text-center text-lg font-bold"
            ref={pixelTitleRef}
            variants={{
              hidden: { opacity: 0, y: 40 },
            }}
            initial="hidden"
          ></motion.h1>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default PixelsAlert;

type Task<T> = () => Promise<T>;

// A basic but robust promise lock
export const createPromiseLock = () => {
  let tail: Promise<unknown> | undefined;

  return async function enqueue<T>(task: Task<T>): Promise<T> {
    let current: Promise<T> | undefined;
    if (tail) {
      current = tail.then(() => {
        return task();
      });
    } else {
      current = task();
    }

    tail = current
      .catch((e) => {
        // If the current task fails, we need to reset the tail
        tail = undefined;
        throw e;
      })
      .finally(() => {
        // If the current task succeeds, we need to reset the tail
        // If the current task is not the tail, we need to keep the tail
        // so that the next task can run
        if (tail === current) {
          tail = undefined;
        }
      });

    return tail as Promise<T>;
  };
};
