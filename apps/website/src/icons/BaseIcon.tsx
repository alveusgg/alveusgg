import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  className?: string;
  alt?: string;
};

export type BaseIconProps = IconProps & {
  viewBox: string;
  children: React.ReactNode | React.ReactNode[];
};

export function BaseIcon({
  size = 24,
  alt = "",
  children,
  ...props
}: BaseIconProps) {
  return (
    <svg
      role="image"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={alt}
      width={size}
      height={size}
      {...props}
    >
      {children}
    </svg>
  );
}
