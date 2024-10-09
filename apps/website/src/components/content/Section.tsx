import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

import topographyTexture from "@/assets/textures/topography.svg";
import dustTexture from "@/assets/textures/dust.svg";

type SectionProps = {
  children?: ReactNode;
  dark?: boolean;
  offsetParent?: boolean;
  className?: string;
  containerClassName?: string;
};

const Section = ({
  children,
  dark,
  offsetParent = true,
  className,
  containerClassName,
}: SectionProps) => {
  // Determine the texture to use
  const opacity = dark ? "opacity-[0.06]" : "opacity-[0.03]";
  const texture = dark ? dustTexture.src : topographyTexture.src;

  return (
    <section
      className={classes(
        offsetParent && "relative z-0",
        dark ? "text-alveus-tan" : "text-alveus-green-900 dark:text-alveus-tan",
        // add vertical padding if not overwritten via className
        !/\bpy-\d+\b/.test(className || "") && "py-16",
        // add background color if not overwritten via className
        !/\bbg-/.test(className || "") &&
          (dark
            ? "bg-alveus-green dark:bg-alveus-green-800"
            : "bg-alveus-tan dark:bg-gray-900"),
        className,
      )}
    >
      {offsetParent && (
        <div
          className={classes(
            `absolute inset-0 -z-10 ${opacity}`,
            !dark && "dark:invert",
          )}
          style={{
            backgroundImage: `url(${texture})`,
            backgroundSize: "32rem",
          }}
        />
      )}
      <div className={classes("container mx-auto px-4", containerClassName)}>
        {children}
      </div>
    </section>
  );
};

export default Section;
