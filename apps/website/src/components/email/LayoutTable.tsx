import type { ComponentPropsWithoutRef } from "react";

type ContainerProps = ComponentPropsWithoutRef<"table">;

export function LayoutTable({ children, ...props }: ContainerProps) {
  return (
    <table
      width="100%"
      {...props}
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
    >
      {children}
    </table>
  );
}
