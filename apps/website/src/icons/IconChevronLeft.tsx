import { BaseIcon, type IconProps } from "@/icons/BaseIcon";

// This SVG code is derived from Heroicons (https://heroicons.com)
// chevron-left-solid
export default function IconChevronLeft(props: IconProps) {
  return (
    <BaseIcon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
        clipRule="evenodd"
      />
    </BaseIcon>
  );
}
