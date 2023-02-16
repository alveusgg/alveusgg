import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: React.ReactNode;
};

export const defaultClasses = "bg-gray-700 text-white";
export const secondaryClasses = "bg-gray-300 text-gray-900";

export function Button({
  children,
  className = defaultClasses,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`flex w-full flex-row justify-center gap-2 rounded-xl p-3 text-center font-semibold ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
