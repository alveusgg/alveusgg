import {
  useEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import throttle from "lodash/throttle";

import { classes } from "@/utils/classes";
import usePrefersReducedMotion from "@/hooks/motion";

export type WiggleProps = {
  children?: ReactNode;
  width: number;
  height: number;
  maxRotationDeg?: number;
  maskImage?: string;
};

export function Wiggle({
  children,
  width,
  height,
  maxRotationDeg = 10,
  style = {},
  className,
  maskImage,
  ...rest
}: WiggleProps & HTMLAttributes<HTMLDivElement>) {
  const reducedMotion = usePrefersReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useMemo(
    () =>
      throttle((event: MouseEvent) => {
        if (reducedMotion) return;

        const card = cardRef.current;
        if (!card) return;

        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        const mouseXRelativeToCard = event.clientX;
        const mouseYRelativeToCard = event.clientY;

        // These ratios will give values between -0.5 to 0.5
        const dx = (mouseXRelativeToCard - cardCenterX) / width;
        const dy = (mouseYRelativeToCard - cardCenterY) / height;

        const rotateY = dx * maxRotationDeg;
        const rotateX = -dy * maxRotationDeg;

        // Calculate the angle based on mouse position
        const angleRadians = Math.atan2(
          event.clientY - cardCenterY,
          event.clientX - cardCenterX,
        );
        const angleDegrees = angleRadians * (180 / Math.PI) - 90; // convert to degrees and shift range from [0, 360]

        // Calculate the intensity based on distance from center of card
        const distanceToMouse = Math.sqrt(
          Math.pow(event.clientX - cardCenterX, 2) +
            Math.pow(event.clientY - cardCenterY, 2),
        );
        const averageRadius = (cardRect.width + cardRect.height) / 4;
        const lightIntensity = Math.min(distanceToMouse / averageRadius, 1);

        card.style.setProperty("--light-angle", `${angleDegrees}deg`);
        card.style.setProperty("--light-intensity", `${lightIntensity}`);
        card.style.setProperty("--rotation-x", `${rotateX}deg`);
        card.style.setProperty("--rotation-y", `${rotateY}deg`);
      }, 50),
    [reducedMotion, width, height, maxRotationDeg],
  );

  // NOTE(pje): I could not get this working. The idea was to use the device orientation API to wiggle the card
  //const handleTilt = useMemo(
  //  () =>
  //    throttle((event: DeviceOrientationEvent) => {
  //      if (reducedMotion) return;
  //
  //      const card = cardRef.current;
  //      if (!card) return;
  //
  //      const beta = event.beta ?? 0; // Value between -180 and 180
  //      const gamma = event.gamma ?? 0; // Value between -90 and 90
  //
  //      // Normalize beta and gamma values to range from -0.5 to 0.5
  //      const dx = gamma / 180;
  //      const dy = beta / 360;
  //
  //      const rotateY = dx * maxRotationDeg;
  //      const rotateX = -dy * maxRotationDeg;
  //
  //      // Assuming light comes from the top, we'll base angle on beta for vertical changes
  //      const angleRadians = beta * (Math.PI / 180); // Convert to radians
  //      const angleDegrees = angleRadians * (180 / Math.PI) - 90; // Convert back to degrees and shift range
  //
  //      // For light intensity, you can use the magnitude of beta and gamma
  //      const distanceToTilt = Math.sqrt(
  //        Math.pow(beta, 2) + Math.pow(gamma, 2),
  //      );
  //      const maxPossibleTilt = Math.sqrt(Math.pow(180, 2) + Math.pow(90, 2));
  //      const lightIntensity = Math.min(distanceToTilt / maxPossibleTilt, 1);
  //
  //      card.style.setProperty("--light-angle", `${angleDegrees}deg`);
  //      card.style.setProperty("--light-intensity", `${lightIntensity}`);
  //      card.style.setProperty("--rotation-x", `${rotateX}deg`);
  //      card.style.setProperty("--rotation-y", `${rotateY}deg`);
  //    }, 50),
  //  [reducedMotion, maxRotationDeg],
  //);

  const hasFinePointer = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches,
    [],
  );
  useEffect(() => {
    if (reducedMotion) return;

    //if (window.DeviceOrientationEvent) {
    //  window.addEventListener("deviceorientation", handleTilt);
    //}
    if (hasFinePointer) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (hasFinePointer) {
        document.removeEventListener("mousemove", handleMouseMove);
      }
      //if (window.DeviceOrientationEvent) {
      //  window.removeEventListener("deviceorientation", handleTilt);
      //}
    };
  }, [reducedMotion, handleMouseMove, hasFinePointer]);

  return (
    <div
      className={classes(
        "origin-center overflow-hidden transition-transform duration-100 ease-in-out transform [--light-angle:90deg] [--light-intensity:0] [--rotation-x:0deg] [--rotation-y:0deg]",
        className,
      )}
      style={{
        maxWidth: width,
        width: "100%",
        maxHeight: height,
        height: "auto",
        aspectRatio: `${width} / ${height}`,
        filter: `drop-shadow(calc(5px * sin(var(--light-angle)))
            calc(5px * cos(var(--light-angle) + 180deg)) 5px
            rgba(0, 0, 0, calc(0.3 * var(--light-intensity))))`,
        transform: !reducedMotion
          ? `perspective(1000px) rotateX(var(--rotation-x)) rotateY(var(--rotation-y))`
          : "",
        ...style,
      }}
      ref={cardRef}
      {...rest}
    >
      {/* Inner wrapper for masking the outline */}
      <div
        className="absolute inset-0"
        style={{
          maskMode: "alpha",
          maskImage: maskImage ? `url("${maskImage}")` : undefined,
          WebkitMaskImage: maskImage ? `url("${maskImage}")` : undefined,
          maskClip: "content-box",
          WebkitMaskClip: "content-box",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      >
        {children}

        {
          /* Light effect */ !reducedMotion ? (
            <i
              className="absolute inset-0"
              style={{
                background: "rgba(255, 255, 240, var(--light-intensity))",
                maskImage:
                  "linear-gradient(var(--light-angle), rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0))",
                WebkitMaskImage:
                  "linear-gradient(var(--light-angle), rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0))",
              }}
            />
          ) : null
        }
      </div>
    </div>
  );
}
