import { type ReactNode, type SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  className?: string;
  alt?: string;
};

export type BaseIconProps = IconProps & {
  viewBox: string;
  children: ReactNode | ReactNode[];
};

export function BaseIcon({
  size = 24,
  alt = "",
  children,
  ...props
}: BaseIconProps) {
  return (
    <svg
      role="img"
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
