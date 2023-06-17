import { BaseIcon, type IconProps } from "@/icons/BaseIcon";

// This SVG code is derived from Heroicons (https://heroicons.com)
// pencil-outline
export default function IconPencil(props: IconProps) {
  return (
    <BaseIcon viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
      />
    </BaseIcon>
  );
}
