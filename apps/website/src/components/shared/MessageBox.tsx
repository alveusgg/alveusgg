import { type ReactNode } from "react";

type MessageBoxProps = {
  children: ReactNode | ReactNode[];
  variant?: "default" | "success" | "warning" | "failure";
};

export function MessageBox({ variant = "default", children }: MessageBoxProps) {
  let classes = "bg-white";
  switch (variant) {
    case "success":
      classes = "bg-green-100";
      break;
    case "warning":
      classes = "bg-yellow-200";
      break;
    case "failure":
      classes = "bg-red-200 text-red-900";
      break;
  }

  return (
    <div className={`rounded-lg ${classes} p-2 shadow-xl`}>{children}</div>
  );
}
