import { BaseIcon, type IconProps } from "@/icons/BaseIcon";

// This SVG code is derived from Heroicons (https://heroicons.com)
// minus-circle-outline
export default function IconMinusCircle(props: IconProps) {
  return (
    <BaseIcon viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </BaseIcon>
  );
}
