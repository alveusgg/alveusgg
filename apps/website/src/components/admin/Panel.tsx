import { type ReactNode } from "react";

export function Panel({
  children,
  lightMode = false,
}: {
  children?: ReactNode | ReactNode[];
  lightMode?: boolean;
}) {
  return (
    <div
      className={`my-4 rounded-sm border p-4 shadow-xl ${
        lightMode
          ? "bg-gray-50 text-gray-800"
          : "border-black bg-gray-900 text-gray-200"
      }`}
    >
      {children}
    </div>
  );
}
