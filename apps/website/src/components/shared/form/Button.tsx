import type { LinkProps } from "next/link";
import Link from "next/link";
import type React from "react";
import { type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";

type ButtonStyleProps = {
  className?: string;
  children: ReactNode | string;
  size?: "default" | "small";
  width?: "full" | "auto";
  confirmationMessage?: string;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps & { ref?: Ref<HTMLButtonElement> };
type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  LinkProps &
  ButtonStyleProps;

const baseClasses =
  "flex flex-row items-center justify-center text-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:opacity-50";
export const defaultButtonClasses = "bg-gray-700 text-white";
export const disabledButtonClasses = "bg-gray-600 text-gray-200";
export const secondaryButtonClasses = "bg-gray-300 text-gray-900";
export const approveButtonClasses = "bg-green-700 text-white";
export const dangerButtonClasses = "bg-red-600 text-white";
export const getSizeClasses = (size: ButtonProps["size"]) => {
  switch (size) {
    case "small":
      return "gap-1 rounded-xl p-1 px-3";
    default:
      return "gap-2 rounded-xl p-3 font-semibold";
  }
};
export const getWidthClasses = (size: ButtonProps["width"]) => {
  switch (size) {
    case "full":
      return "w-full";
    default:
      return "";
  }
};

export function LinkButton({
  children,
  size = "default",
  width = "full",
  className = defaultButtonClasses,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`${baseClasses} ${getWidthClasses(width)} ${getSizeClasses(
        size,
      )} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

export const Button = ({
  children,
  type = "button",
  size = "default",
  width = "full",
  className = defaultButtonClasses,
  confirmationMessage,
  ...props
}: ButtonProps) => {
  const buttonProps = { ...props };
  if (confirmationMessage) {
    buttonProps.onClick = (e) => {
      if (confirm(confirmationMessage)) {
        props.onClick?.(e);
      } else {
        e.preventDefault();
      }
    };
  }

  return (
    <button
      type={type}
      className={`${baseClasses} ${getWidthClasses(width)} ${getSizeClasses(
        size,
      )} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  );
};
