import { BaseIcon, type IconProps } from "@/icons/BaseIcon";

// This SVG code is derived from Heroicons (https://heroicons.com)
// chevron-up-solid
export default function IconChevronUp(props: IconProps) {
  return (
    <BaseIcon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z"
        clipRule="evenodd"
      />
    </BaseIcon>
  );
}
