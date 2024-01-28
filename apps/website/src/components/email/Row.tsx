import type { ComponentPropsWithoutRef } from "react";

import { LayoutTable } from "./LayoutTable";

type RowProps = ComponentPropsWithoutRef<"table">;
type ColumnProps = ComponentPropsWithoutRef<"td">;

export function Row({ children, ...props }: RowProps) {
  return (
    <LayoutTable align="center" {...props}>
      <tbody style={{ width: "100%" }}>
        <tr style={{ width: "100%" }}>{children}</tr>
      </tbody>
    </LayoutTable>
  );
}

function RowColumn({ children, ...props }: ColumnProps) {
  return <td {...props}>{children}</td>;
}

Row.Column = RowColumn;
