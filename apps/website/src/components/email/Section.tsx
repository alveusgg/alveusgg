import type { ComponentPropsWithoutRef } from "react";

import { LayoutTable } from "@/components/email/LayoutTable";

type SectionProps = ComponentPropsWithoutRef<"table">;

export function Section({ children, ...props }: SectionProps) {
  return (
    <LayoutTable {...props}>
      <tbody>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>
    </LayoutTable>
  );
}
