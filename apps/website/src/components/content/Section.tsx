import React, { useMemo } from "react"
import topographyTexture from "../../assets/textures/topography.svg";
import dustTexture from "../../assets/textures/dust.svg";

type SectionProps = {
  children?: React.ReactNode;
  dark?: boolean;
  className?: string;
  containerClassName?: string;
};

const Section: React.FC<SectionProps> = ({ children, dark, className, containerClassName }) => {
  // Determine the classes for the two elements
  const sectionClass = useMemo(() => [
    'py-16 relative z-0',
    dark && 'bg-alveus-green text-alveus-tan',
    !dark && 'bg-alveus-tan text-alveus-green-900',
    className,
  ].filter(Boolean).join(' '), [ dark, className ]);
  const containerClass = useMemo(() => [
    'container mx-auto px-4',
    containerClassName,
  ].filter(Boolean).join(' '), [ containerClassName ]);

  // Determine the texture to use
  const opacity = dark ? 'opacity-[0.06]' : 'opacity-[0.03]';
  const texture = dark ? dustTexture.src : topographyTexture.src;

  return (
    <section className={sectionClass}>
      <div
        className={`absolute inset-0 -z-10 ${opacity}`}
        style={{ backgroundImage: `url(${texture})`, backgroundSize: '32rem' }}
      />
      <div className={containerClass}>
        {children}
      </div>
    </section>
  );
};

export default Section;
