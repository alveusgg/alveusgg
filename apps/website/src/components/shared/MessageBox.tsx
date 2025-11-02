import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

import Box from "@/components/content/Box";

type MessageBoxProps = {
  children: ReactNode | ReactNode[];
  className?: string;
  variant?: "default" | "success" | "warning" | "failure";
};

export function MessageBox({
  variant = "default",
  className = "",
  children,
}: MessageBoxProps) {
  let variantClasses = "bg-white text-black";
  switch (variant) {
    case "success":
      variantClasses = "bg-green-100 text-black";
      break;
    case "warning":
      variantClasses = "bg-yellow-200 text-black";
      break;
    case "failure":
      variantClasses = "bg-red-200 text-red-900";
      break;
  }

  return <Box className={classes(variantClasses, className)}>{children}</Box>;
}
