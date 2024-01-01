import type { ComponentPropsWithoutRef } from "react";

import { LayoutTable } from "./LayoutTable";

type ContainerProps = ComponentPropsWithoutRef<"table">;

export function Container({ children, style, ...props }: ContainerProps) {
  return (
    <LayoutTable
      align="center"
      {...props}
      style={{ maxWidth: "37.5em", ...style }}
    >
      <tbody>
        <tr style={{ width: "100%" }}>
          <td>{children}</td>
        </tr>
      </tbody>
    </LayoutTable>
  );
}
