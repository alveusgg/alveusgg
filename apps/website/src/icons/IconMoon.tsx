import { BaseIcon, type IconProps } from "@/icons/BaseIcon";

// This SVG code is derived from Heroicons (https://heroicons.com)
// moon
export default function IconMoon(props: IconProps) {
  return (
    <BaseIcon viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        strokeWidth="1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </BaseIcon>
  );
}
