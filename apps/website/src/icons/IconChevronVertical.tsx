import { BaseIcon, type IconProps } from "@/icons/BaseIcon";

// This SVG code is derived from Heroicons (https://heroicons.com)
// chevron-up-down-solid
export default function IconChevronVertical(props: IconProps) {
  return (
    <BaseIcon viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        d="M11.47 4.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06L12 6.31 8.78 9.53a.75.75 0 01-1.06-1.06l3.75-3.75zm-3.75 9.75a.75.75 0 011.06 0L12 17.69l3.22-3.22a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0l-3.75-3.75a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </BaseIcon>
  );
}
