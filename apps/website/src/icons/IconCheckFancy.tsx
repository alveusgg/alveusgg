import { BaseIcon, type IconProps } from "@/icons/BaseIcon";

// This SVG code is derived from Wikimedia
// https://commons.wikimedia.org/wiki/File:Yes_check.svg
export default function IconCheckFancy(props: IconProps) {
  return (
    <BaseIcon viewBox="0 0 600 600" {...props}>
      <path
        fill="currentColor"
        d="m7.7,404.6c0,0 115.2,129.7 138.2,182.68l99,0c41.5-126.7 202.7-429.1 340.92-535.1c28.6-36.8-43.3-52-101.35-27.62-87.5,36.7-252.5,317.2-283.3,384.64-43.7,11.5-89.8-73.7-89.84-73.7z"
      />
    </BaseIcon>
  );
}
