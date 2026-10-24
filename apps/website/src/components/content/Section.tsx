import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

import dustTexture from "@/assets/textures/dust.svg";
import topographyTexture from "@/assets/textures/topography.svg";

type SectionProps = {
  children?: ReactNode;
  dark?: boolean;
  offsetParent?: boolean;
  className?: string;
  containerClassName?: string;
  as?: "section" | "footer";
};

const Section = ({
  children,
  dark,
  offsetParent = true,
  className,
  containerClassName,
  as: Component = "section",
}: SectionProps) => {
  // Determine the texture to use
  const opacity = dark ? "opacity-[0.06]" : "opacity-[0.03]";
  const texture = dark ? dustTexture.src : topographyTexture.src;

  return (
    <Component
      className={classes(
        offsetParent && "relative z-0",
        "py-16",
        dark
          ? "bg-alveus-green text-alveus-tan"
          : "bg-alveus-tan text-alveus-green-900",
        className,
      )}
    >
      {offsetParent && (
        <div
          className={`absolute inset-0 -z-10 ${opacity}`}
          style={{
            backgroundImage: `url(${texture})`,
            backgroundSize: "32rem",
          }}
        />
      )}
      <div className={classes("container mx-auto px-4", containerClassName)}>
        {children}
      </div>
    </Component>
  );
};

export default Section;
