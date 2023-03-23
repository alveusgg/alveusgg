import React from "react";

type IconProps = {
  size?: number;
  className?: string;
  alt?: string;
};

const IconAngleLeft: React.FC<IconProps> = ({ size = 24, className, alt }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 256 512"
    className={className}
    aria-label={alt}
  >
    <path
      fill="currentColor"
      d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
    />
  </svg>
);

export default IconAngleLeft;
