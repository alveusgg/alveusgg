import React from "react";

type IconProps = {
  size?: number;
  className?: string;
  alt?: string;
};

const IconAngleUp: React.FC<IconProps> = ({ size = 24, className, alt }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 384 512"
    className={className}
    aria-label={alt}
  >
    <path
      fill="currentColor"
      d="M169.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L192 205.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"
    />
  </svg>
);

export default IconAngleUp;
